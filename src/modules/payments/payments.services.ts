import { AppError } from "src/shared/helper/appError";
import { findByUuid, update } from "./payments.repo";
import { IPaymentBody, IUpdateManualPaymentBody } from "./payments.model";

export const updateManualPaymentService = async (
  uuid: string,
  body: IUpdateManualPaymentBody,
) => {
  const payment = await findByUuid(uuid);

  if (payment.length < 1) {
    throw new AppError("NOT_FOUND", "Payment not found", 404);
  }

  const currentPayment = payment[0];

  if (currentPayment.status !== "pending") {
    throw new AppError(
      "INVALID_PAYMENT_STATUS",
      `Payment has already been ${currentPayment.status}`,
      400,
    );
  }

  const updatedPayment = await update(uuid, {
    ...body,
    paid_at: body.status === "paid" ? new Date() : undefined,
  });

  if (updatedPayment.length < 1) {
    throw new AppError("NO_DATA", "Payment not found", 404);
  }

  return updatedPayment;
};
