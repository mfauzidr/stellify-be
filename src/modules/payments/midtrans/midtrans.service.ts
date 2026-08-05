import { AppError } from "src/shared/helper/appError";
import { snap } from "src/shared/config/midtrans";
import {
  ICreateSnapTransactionBody,
  IMidtransNotificationBody,
  ISnapTransaction,
} from "./midtrans.model";
import * as paymentsRepo from "src/modules/payments/payments.repo";
import {
  mapMidtransStatus,
  verifySignature,
} from "src/modules/payments/midtrans/midtrans.helper";
import { IPayment } from "../payments.model";
import {
  getTransactionStatus,
  cancelTransaction,
  expireTransaction,
} from "./midtrans.api";

export const createSnapTransaction = async (
  body: ICreateSnapTransactionBody,
): Promise<ISnapTransaction> => {
  const parameter = {
    transaction_details: {
      order_id: body.order_number,
      gross_amount: body.gross_amount,
    },

    customer_details: {
      first_name: body.customer.first_name,
      email: body.customer.email,
      phone: body.customer.phone,
    },
  };

  const transaction = await snap.createTransaction(parameter);

  console.log("Snap parameter created:", parameter);
  console.log("Snap transaction created:", transaction);

  return {
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  };
};

export const handleNotification = async (
  body: IMidtransNotificationBody,
): Promise<IPayment> => {
  verifySignature({
    order_id: body.order_id,
    status_code: body.status_code,
    gross_amount: body.gross_amount,
    signature_key: body.signature_key,
  });

  const payments = await paymentsRepo.findByProviderOrderId(body.order_id);

  if (payments.length < 1) {
    throw new AppError("NOT_FOUND", "Payment not found", 404);
  }

  const payment = payments[0];

  // Idempotent
  if (payment.status === "paid") {
    return payment;
  }

  const paymentStatus = mapMidtransStatus(body.transaction_status);

  const [updatedPayment] = await paymentsRepo.update(payment.uuid, {
    status: paymentStatus,
    transaction_id: body.transaction_id,
    payment_type: body.payment_type,
    fraud_status: body.fraud_status,
    raw_response: body,
    paid_at:
      paymentStatus === "paid" ? new Date(body.transaction_time) : undefined,
    expired_at:
      paymentStatus === "expired" ? new Date(body.transaction_time) : undefined,
  });

  return updatedPayment;
};

export const syncPaymentStatus = async (
  paymentUuid: string,
): Promise<IPayment> => {
  const [payment] = await paymentsRepo.findByUuid(paymentUuid);

  if (!payment) {
    throw new AppError("NOT_FOUND", "Payment not found", 404);
  }

  if (payment.provider !== "midtrans") {
    throw new AppError(
      "INVALID_PROVIDER",
      "This payment is not using Midtrans",
      400,
    );
  }

  const transaction = await getTransactionStatus(payment.provider_order_id);

  const paymentStatus = mapMidtransStatus(transaction.transaction_status);

  const [updatedPayment] = await paymentsRepo.update(payment.uuid, {
    transaction_id: transaction.transaction_id,
    payment_type: transaction.payment_type,
    gross_amount: Number(transaction.gross_amount),
    fraud_status: transaction.fraud_status,
    status: paymentStatus,
    paid_at:
      paymentStatus === "paid"
        ? new Date(transaction.transaction_time)
        : undefined,
    raw_response: transaction,
  });

  return updatedPayment;
};

export const cancelPayment = async (
  paymentUuid: string,
): Promise<IPayment> => {
  const [payment] = await paymentsRepo.findByUuid(paymentUuid);
  console.log("Cancel payment called with UUID:", paymentUuid);
  console.log("Payment Provider_order_id details:", payment.provider_order_id);

  if (!payment) {
    throw new AppError(
      "NOT_FOUND",
      "Payment not found",
      404,
    );
  }

  if (payment.provider !== "midtrans") {
    throw new AppError(
      "INVALID_PROVIDER",
      "This payment is not using Midtrans",
      400,
    );
  }

  const status = await getTransactionStatus(payment.provider_order_id);

  console.log("status:",status);

  await cancelTransaction(payment.provider_order_id);

  return await syncPaymentStatus(payment.uuid);
};

export const expirePayment = async (
  paymentUuid: string,
): Promise<IPayment> => {
  const [payment] = await paymentsRepo.findByUuid(paymentUuid);

  if (!payment) {
    throw new AppError(
      "NOT_FOUND",
      "Payment not found",
      404,
    );
  }

  if (payment.provider !== "midtrans") {
    throw new AppError(
      "INVALID_PROVIDER",
      "This payment is not using Midtrans",
      400,
    );
  }

  await expireTransaction(payment.provider_order_id);

  return await syncPaymentStatus(payment.uuid);
};

export const getPayment = async () => {};

export const retryPayment = async () => {};
