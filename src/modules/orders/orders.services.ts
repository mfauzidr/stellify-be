import { AppError } from "src/shared/helper/appError";

import { ICreateOrderBody, IOrders, IOrderService } from "./orders.model";
import db from "src/shared/config/pg";
import { generateOrderNumber } from "src/shared/helper/generateOrderNumber";
import * as chekiPackageRepo from "src/modules/cheki/cheki.repo";
import * as eventsRepo from "src/modules/events/events.repo";
import * as ordersRepo from "src/modules/orders/orders.repo";
import * as paymentsRepo from "src/modules/payments/payments.repo";
import * as orderItemsRepo from "src/modules/order_items/order_items.repo";
import * as orderItemMembersRepo from "src/modules/order_item_members/order_item_members.repo";
import { createSnapTransaction } from "../payments/midtrans/midtrans.service";

const validateCreateOrderBody = (body: ICreateOrderBody): void => {
  if (
    !body ||
    typeof body.customer_name !== "string" ||
    !body.customer_name.trim() ||
    typeof body.customer_email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email) ||
    typeof body.customer_phone !== "string" ||
    !body.customer_phone.trim()
  ) {
    throw new AppError("INVALID_INPUT", "Customer details are invalid", 400);
  }

  if (!["midtrans", "cash", "bank_transfer"].includes(body.payment_method)) {
    throw new AppError("INVALID_PAYMENT_METHOD", "Invalid payment method", 400);
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new AppError("NO_ITEM", "At least one item is required", 400);
  }

  for (const item of body.items) {
    if (
      !item ||
      typeof item.cheki_package_uuid !== "string" ||
      !item.cheki_package_uuid ||
      !Number.isSafeInteger(item.qty) ||
      item.qty < 1 ||
      !Array.isArray(item.member_uuids) ||
      item.member_uuids.length === 0 ||
      item.member_uuids.some(
        (memberUuid) => typeof memberUuid !== "string" || !memberUuid,
      )
    ) {
      throw new AppError("INVALID_INPUT", "Order item is invalid", 400);
    }
  }
};

export const createOrderService = async (
  body: ICreateOrderBody,
  userUuid?: string,
): Promise<IOrderService> => {
  validateCreateOrderBody(body);
  const client = await db.connect();
  let order: IOrders;
  let payment: Awaited<ReturnType<typeof paymentsRepo.insert>>[number];
  let transactionStarted = false;
  const processedItems: {
    package_uuid: string;
    package_title: string;
    qty: number;
    price: number;
    member_uuids: string[];
  }[] = [];

  try {
    await client.query("BEGIN");
    transactionStarted = true;
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", ["CHK"]);

    const now = new Date();

    const orderNumber = await generateOrderNumber("CHK", client);

    let totalAmount = 0;

    let eventUuid: string | undefined;
    let orderPhase: "po" | "ots" | undefined;

    for (const item of body.items) {
      const [chekiPackage] = await chekiPackageRepo.findByUuid(
        item.cheki_package_uuid,
        true,
      );

      if (!chekiPackage) {
        throw new AppError("NO_DATA", "Cheki package not found", 404);
      }

      const [event] = await eventsRepo.findByUuid(
        chekiPackage.event_uuid,
        client,
        false,
      );
      if (!event) {
        throw new AppError("NO_DATA", "Event not found", 404);
      }
      if (event.status !== "published") {
        throw new AppError("INVALID_EVENT_STATUS", "Event is not available for orders", 400);
      }

      if (!eventUuid) {
        eventUuid = event.uuid;
      } else if (eventUuid !== event.uuid) {
        throw new AppError(
          "INVALID_EVENT",
          "All items must belong to the same event",
          400,
        );
      }

      const poStart = new Date(event.po_start);
      const poEnd = new Date(event.po_end);
      const eventDate = new Date(event.event_date).toISOString().slice(0, 10);
      const eventDay = new Date(`${eventDate}T23:59:59.999Z`);

      if (now < poStart) {
        throw new AppError(
          "INVALID_PO_PERIOD",
          "Pre-order has not started",
          400,
        );
      }

      if (now > eventDay) {
        throw new AppError("EVENT_ENDED", "This event has ended", 400);
      }

      const isPO = now <= poEnd;

      if (isPO && body.payment_method === "cash") {
        throw new AppError(
          "INVALID_PAYMENT_METHOD",
          "Cash payment is not available for pre-order",
          400,
        );
      }

      const currentOrderPhase = isPO ? "po" : "ots";

      if (!orderPhase) {
        orderPhase = currentOrderPhase;
      } else if (orderPhase !== currentOrderPhase) {
        throw new AppError(
          "INVALID_ORDER_PHASE",
          "All items must have the same order type",
          400,
        );
      }

      const uniqueMembers = new Set(item.member_uuids);

      if (uniqueMembers.size !== item.member_uuids.length) {
        throw new AppError(
          "DUPLICATE_MEMBER",
          "Duplicate member selected",
          400,
        );
      }

      const isSingle = item.member_uuids.length === 1;

      if (isSingle && !chekiPackage.allow_single) {
        throw new AppError(
          "INVALID_INPUT",
          "This package does not support single member",
          400,
        );
      }

      if (!isSingle && !chekiPackage.allow_group) {
        throw new AppError(
          "INVALID_INPUT",
          "This package does not support group member",
          400,
        );
      }

      const validMembers = await client.query<{ member_uuid: string }>(
        `
          SELECT "em"."member_uuid"
          FROM "event_members" "em"
          JOIN "members" "m" ON "m"."uuid" = "em"."member_uuid"
          WHERE "em"."event_uuid" = $1
            AND "em"."member_uuid" = ANY($2::uuid[])
            AND "m"."is_active" = true
        `,
        [event.uuid, item.member_uuids],
      );
      if (validMembers.rowCount !== item.member_uuids.length) {
        throw new AppError(
          "INVALID_MEMBER",
          "Selected members must be active members of the event",
          400,
        );
      }

      const price = isPO
        ? isSingle
          ? Number(chekiPackage.po_price_single)
          : Number(chekiPackage.po_price_group)
        : isSingle
          ? Number(chekiPackage.ots_price_single)
          : Number(chekiPackage.ots_price_group);
      if (!Number.isSafeInteger(price) || price < 0) {
        throw new AppError("INVALID_PRICE", "Package price is invalid", 400);
      }

      const subtotal = price * item.qty;

      totalAmount += subtotal;
      if (!Number.isSafeInteger(totalAmount)) {
        throw new AppError("INVALID_AMOUNT", "Order amount is invalid", 400);
      }

      processedItems.push({
        package_uuid: chekiPackage.uuid,
        package_title: chekiPackage.title,
        qty: item.qty,
        price,
        member_uuids: item.member_uuids,
      });
    }

    const [insertedOrder] = await ordersRepo.insert(
      {
        user_uuid: userUuid,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        payment_method: body.payment_method,
        notes: body.notes,
        order_number: orderNumber,
        total_amount: totalAmount,
        event_uuid: eventUuid,
        order_phase: orderPhase,
      },
      client,
    );
    order = insertedOrder;

    const provider = body.payment_method === "midtrans" ? "midtrans" : "manual";

    const [insertedPayment] = await paymentsRepo.insert(
      {
        order_type: "cheki",
        order_uuid: order.uuid,
        provider,
        provider_order_id: order.order_number,
        gross_amount: totalAmount,
        status: "pending",
      },
      client,
    );
    payment = insertedPayment;

    for (const item of processedItems) {
      const [orderItem] = await orderItemsRepo.insert(
        {
          order_uuid: order.uuid,
          package_uuid: item.package_uuid,
          qty: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        },
        client,
      );

      for (const memberUuid of item.member_uuids) {
        await orderItemMembersRepo.insert(
          {
            order_item_uuid: orderItem.uuid,
            member_uuid: memberUuid,
          },
          client,
        );
      }
    }

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }

  let finalPayment = payment;
  if (body.payment_method === "midtrans") {
    const snapTransaction = await createSnapTransaction({
      order_number: order.order_number,
      gross_amount: Number(payment.gross_amount),
      customer: {
        first_name: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone,
      },
      items: processedItems.map((item) => ({
        id: item.package_uuid,
        name: item.package_title,
        price: item.price,
        quantity: item.qty,
      })),
    });

    const [updatedPayment] = await paymentsRepo.update(payment.uuid, {
      snap_token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
    });
    if (!updatedPayment) {
      throw new AppError(
        "PAYMENT_UPDATE_FAILED",
        "Payment was created but its Snap details could not be saved",
        500,
      );
    }
    finalPayment = updatedPayment;
  }

  return { order, payment: finalPayment };
};

export const checkInService = async (
  orderUuid: string,
  checkedInBy: string,
): Promise<IOrders> => {
  const [updatedOrder] = await ordersRepo.checkIn(orderUuid, checkedInBy);
  if (updatedOrder) {
    return updatedOrder;
  }

  const [order] = await ordersRepo.findDetails(orderUuid);
  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found", 404);
  }

  const [payment] = await paymentsRepo.findByProviderOrderId(
    order.order_number,
  );

  if (!payment || payment.status !== "paid") {
    throw new AppError("NOT_PAID", "Order has not been paid", 400);
  }

  if (order.checked_in_at !== null) {
    throw new AppError(
      "ALREADY_CHECKED_IN",
      "Order has already been checked in",
      400,
    );
  }

  throw new AppError(
    "CHECK_IN_FAILED",
    "Order could not be checked in; retry the request",
    409,
  );
};
