import { NextFunction, Request, Response } from "express";
import {
  ICreateOrderBody,
  IOrderBody,
  IOrderQueryParams,
  IOrders,
  PaymentStatus,
  UpdatePaymentStatus,
} from "./orders.model";
import {
  IOrderListResponse,
  IOrderResponse,
} from "src/shared/models/response.model";
import {
  findAll,
  findDetails,
  insert,
  totalCount,
  
} from "./orders.repo";
import { AppError } from "src/shared/helper/appError";
import paginLink from "src/shared/helper/paginLinks";
import { generateOrderNumber } from "src/shared/helper/generateOrderNumber";
import { IPayload } from "src/shared/models/payload.model";
import { createOrderService } from "./orders.services";
// import { updatePaymentStatusService } from "./orders.services";

export const getAllOrders = async (
  req: Request<{}, {}, {}, IOrderQueryParams>,
  res: Response<IOrderListResponse>,
) => {
  const query: IOrderQueryParams = {
    ...req.query,
  };
  const user = (
    req as Request & {
      userPayload: IPayload;
    }
  ).userPayload;

  if (user.role === "user") {
    query.user_uuid = user.uuid;
  }

  const orders = await findAll(query);

  if (orders.length < 1) {
    throw new AppError("NO_DATA", "Orders not found", 404);
  }

  const limit = Number(query.limit || 12);
  const currentPage = Number(query.page || 1);

  const totalData = await totalCount(query);
  const totalPage = Math.ceil(totalData / limit);

  return res.status(200).json({
    meta: {
      totalData,
      totalPage,
      currentPage,
      nextPage: currentPage < totalPage ? paginLink(req, "next") : null,
      prevPage: currentPage > 1 ? paginLink(req, "previous") : null,
    },
    success: true,
    message: `List all orders. ${totalData} data found`,
    results: orders,
  });
};

export const getDetailOrder = async (
  req: Request<IOrders>,
  res: Response<IOrderResponse>
): Promise<Response> => {
  const { uuid } = req.params;
  const order = await findDetails(uuid);
  if (order.length === 0) {
    throw new AppError("NOT_FOUND", "Order not found", 404);
  }
  return res.json({
    success: true,
    message: "OK",
    results: order,
  });
};

export const createOrder = async (
  req: Request<{}, {}, ICreateOrderBody>,
  res: Response<IOrderListResponse>,
  next: NextFunction
) => {

  const body  = req.body
  try{
    await createOrderService(body)

    return res.status(200).json({
      success: true,
      message: "Create order successfully",
    });
  } catch (error) {
    next(error)
  }

};

// export const updatePaymentStatus = async (
//   req: Request<{ uuid: string }, {}, { status: UpdatePaymentStatus }>,
//   res: Response<IOrderResponse>,
// ): Promise<Response> => {
//   const { uuid } = req.params;

//   if (!uuid) {
//     throw new AppError("NO_UUID", "Order UUID must be provided", 400);
//   }

//   const { status } = req.body;

//   if (!status) {
//     throw new AppError(
//       "MISSING_FIELD",
//       "payment_status cannot be empty",
//       400,
//     );
//   }

//   const allowedStatus: UpdatePaymentStatus[] = ["paid", "expired"];

//   if (!allowedStatus.includes(status)) {
//     throw new AppError(
//       "INVALID_PAYMENT_STATUS",
//       "Invalid payment status",
//       400,
//     );
//   }

//   const updatedOrder = await updatePaymentStatusService(uuid, status);

//   return res.json({
//     success: true,
//     message: "Update payment status successfully",
//     results: updatedOrder,
//   });
// };
