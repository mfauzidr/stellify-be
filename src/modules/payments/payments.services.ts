import { AppError } from "src/shared/helper/appError";
import { findByUuid, updatePendingManual } from "./payments.repo";
import { IUpdateManualPaymentBody } from "./payments.model";

export const updateManualPaymentService = async (
  uuid: string,
  body: IUpdateManualPaymentBody,
) => {
  const payment = await findByUuid(uuid);

  if (payment.length < 1) {
    throw new AppError("NOT_FOUND", "Payment not found", 404);
  }

  const currentPayment = payment[0];

  if (currentPayment.provider !== "manual") {
    throw new AppError(
      "INVALID_PROVIDER",
      "Manual status updates are only allowed for manual payments",
      400,
    );
  }

  if (currentPayment.status !== "pending") {
    throw new AppError(
      "INVALID_PAYMENT_STATUS",
      `Payment has already been ${currentPayment.status}`,
      400,
    );
  }

  const updatedPayment = await updatePendingManual(uuid, body.status);

  if (updatedPayment.length < 1) {
    throw new AppError(
      "INVALID_PAYMENT_STATUS",
      "Payment status changed before the update could be applied",
      400,
    );
  }

  return updatedPayment;
};
