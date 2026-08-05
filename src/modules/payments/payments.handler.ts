import { NextFunction, Request, Response } from "express";
import { AppError } from "../../shared/helper/appError";
import { IOrderResponse, IPaymentsResponse } from "src/shared/models/response.model";
import { findByUuid } from "./payments.repo";
import { UpdatePaymentStatus } from "../orders/orders.model";
import { updateManualPaymentService } from "./payments.services";
import { IUpdateManualPaymentBody } from "./payments.model";
import { IMidtransNotificationBody } from "./midtrans/midtrans.model";
import { handleNotification } from "./midtrans/midtrans.service";


export const getByUuid = async (
  req: Request<{ uuid: string }>,
  res: Response<IPaymentsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const payment = await findByUuid(uuid as string);
  if (payment.length === 0) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }
  return res.status(200).json({
    success: true,
    message: `Detail payment with uuid ${uuid}`,
    results: payment,
  });
};

export const updateManualPayment = async (
  req: Request<{ uuid: string }, {}, IUpdateManualPaymentBody>,
  res: Response<IPaymentsResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  const { status } = req.body;

  if (!status) {
    throw new AppError(
      "MISSING_FIELD",
      "payment_status cannot be empty",
      400,
    );
  }

  const allowedStatus: UpdatePaymentStatus[] = ["paid", "cancelled"];

  if (!allowedStatus.includes(status)) {
    throw new AppError(
      "INVALID_PAYMENT_STATUS",
      "Invalid payment status",
      400,
    );
  }

  const updatedPayment = await updateManualPaymentService(uuid, req.body);

  return res.json({
    success: true,
    message: "Update payment status successfully",
    results: updatedPayment,
  });
};


export const notification = async (
  req: Request<{}, {}, IMidtransNotificationBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment = await handleNotification(req.body);

    return res.status(200).json({
      success: true,
      message: "Notification processed",
      results: payment,
    });
  } catch (error) {
    next(error);
  }
};