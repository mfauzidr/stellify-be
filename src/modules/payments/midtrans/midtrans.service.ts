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
import { IPayment, PaymentStatus } from "../payments.model";

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
  if (!transaction) {
    throw new AppError(
      "SNAP_TRANSACTION_ERROR",
      "Failed to create snap transaction",
      500,
    );
  }

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

  console.log({
    order_id: body.order_id,
    transaction_status: body.transaction_status,
  });

  return updatedPayment;
};

export const getTransactionStatus = async () => {};

export const cancelTransaction = async () => {};

export const expireTransaction = async () => {};
