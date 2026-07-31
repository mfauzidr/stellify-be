import { AppError } from "src/shared/helper/appError";

import { ICreateOrderBody, IOrders, UpdatePaymentStatus } from "./orders.model";
import { findDetails } from "./orders.repo";
import db from "src/shared/config/pg";
import { generateOrderNumber } from "src/shared/helper/generateOrderNumber";
import * as chekiPackageRepo from "src/modules/cheki/cheki.repo";
import * as eventsRepo from "src/modules/events/events.repo";
import * as ordersRepo from "src/modules/orders/orders.repo";
import * as paymentsRepo from "src/modules/payments/payments.repo";
import * as orderItemsRepo from "src/modules/order_items/order_items.repo";
import * as orderItemMembersRepo from "src/modules/order_item_members/order_item_members.repo";

export const createOrderService = async (
  body: ICreateOrderBody,
): Promise<IOrders> => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const now = new Date();

    const orderNumber = await generateOrderNumber("CHK");

    let totalAmount = 0;

    let eventUuid: string | undefined;
    let orderPhase: "po" | "ots" | undefined;

    const processedItems: {
      package_uuid: string;
      qty: number;
      price: number;
      subtotal: number;
      member_uuids: string[];
    }[] = [];

    for (const item of body.items) {
      const [chekiPackage] = await chekiPackageRepo.findByUuid(
        item.cheki_package_uuid,
      );

      if (!chekiPackage) {
        throw new AppError("NO_DATA", "Cheki package not found", 404);
      }

      const [event] = await eventsRepo.findByUuid(chekiPackage.event_uuid);
      if (!event) {
        throw new AppError("NO_DATA", "Event not found", 404);
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
      const eventDate = new Date(event.event_date);

      if (now < poStart) {
        throw new AppError(
          "INVALID_PO_PERIOD",
          "Pre-order has not started",
          400,
        );
      }

      if (now > eventDate) {
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

      if (item.qty < 1) {
        throw new AppError("NO_ITEM", "Please insert item quantity", 400);
      }

      if (!item.member_uuids.length) {
        throw new AppError("NO_UUID", "Please select at least one member", 400);
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

      const price = isPO
        ? isSingle
          ? Number(chekiPackage.po_price_single)
          : Number(chekiPackage.po_price_group)
        : isSingle
          ? Number(chekiPackage.ots_price_single)
          : Number(chekiPackage.ots_price_group);

      const subtotal = price * item.qty;

      totalAmount += subtotal;

      processedItems.push({
        package_uuid: chekiPackage.uuid,
        qty: item.qty,
        price,
        subtotal,
        member_uuids: item.member_uuids,
      });
    }

    const [order] = await ordersRepo.insert(
      {
        user_uuid: body.user_uuid,
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

    const provider = body.payment_method === "midtrans" ? "midtrans" : "manual";

    const initialPaymentStatus =
      orderPhase === "ots" && body.payment_method === "cash"
        ? "paid"
        : "pending";

    await paymentsRepo.insert(
      {
        order_type: "cheki",
        order_uuid: order.uuid,
        provider,
        provider_order_id: order.order_number,
        gross_amount: totalAmount,
        status: initialPaymentStatus,
        paid_at: initialPaymentStatus === "paid" ? new Date() : undefined,
      },
      client,
    );

    for (const item of processedItems) {
      const [orderItem] = await orderItemsRepo.insert(
        {
          order_uuid: order.uuid,
          package_uuid: item.package_uuid,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal,
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

    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// export const updatePaymentStatusService = async (
//   uuid: string,
//   status: UpdatePaymentStatus,
// ) => {
//   const order = await findDetails(uuid);

//   if (order.length < 1) {
//     throw new AppError("NOT_FOUND", "Order not found", 404);
//   }

//   const currentOrder = order[0];

//   if (currentOrder.payment_status !== "pending") {
//     throw new AppError(
//       "INVALID_PAYMENT_STATUS",
//       `Order has already been ${currentOrder.payment_status}`,
//       400,
//     );
//   }

//   const updatedOrder = await update(uuid, status);

//   if (updatedOrder.length < 1) {
//     throw new AppError("NO_DATA", "Order not found", 404);
//   }

//   return updatedOrder;
// };
