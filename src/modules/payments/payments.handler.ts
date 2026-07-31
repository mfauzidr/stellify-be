import { Request, Response } from "express";
import { AppError } from "../../shared/helper/appError";
import { IPaymentsResponse } from "src/shared/models/response.model";
import { findByUuid } from "./payments.repo";


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


