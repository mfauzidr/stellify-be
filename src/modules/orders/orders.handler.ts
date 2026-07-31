import { NextFunction, Request, Response } from "express";
import { ICreateOrderBody, IOrderQueryParams, IOrders } from "./orders.model";
import {
  IOrderDetailResponse,
  IOrderListResponse,
  IOrderResponse,
} from "src/shared/models/response.model";
import { findAll, findDetails, totalCount } from "./orders.repo";
import { AppError } from "src/shared/helper/appError";
import paginLink from "src/shared/helper/paginLinks";
import { IPayload } from "src/shared/models/payload.model";
import { createOrderService } from "./orders.services";

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
  res: Response<IOrderDetailResponse>,
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
  next: NextFunction,
) => {
  const body = req.body;

  const user = (
    req as Request & {
      userPayload?: IPayload;
    }
  ).userPayload;

  console.log("User Payload :", user)

  try {
    await createOrderService(body, user?.uuid);

    return res.status(200).json({
      success: true,
      message: "Create order successfully",
    });
  } catch (error) {
    next(error);
  }
};
