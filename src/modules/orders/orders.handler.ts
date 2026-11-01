import { NextFunction, Request, Response } from "express";
import { ICreateOrderBody, IOrderQueryParams } from "./orders.model";
import {
  IOrderDetailResponse,
  ICreateOrderResponse,
  IOrderListResponse,
  IOrderResponse,
} from "src/shared/models/response.model";
import {
  findAll,
  findDetails,
  findOrderOwner,
  totalCount,
} from "./orders.repo";
import { AppError } from "src/shared/helper/appError";
import paginLink from "src/shared/helper/paginLinks";
import { checkInService, createOrderService } from "./orders.services";

export const getAllOrders = async (
  req: Request<{}, {}, {}, IOrderQueryParams>,
  res: Response<IOrderListResponse>,
) => {
  const query: IOrderQueryParams = {
    ...req.query,
  };
  const user = req.userPayload;
  if (!user) {
    throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
  }

  if (user.role === "user") {
    query.user_uuid = user.uuid;
  }
  let checkedInFilter: boolean | undefined;
  if (query.checked_in !== undefined) {
    if (query.checked_in !== "true" && query.checked_in !== "false") {
      throw new AppError("INVALID_INPUT", "checked_in must be true or false", 400);
    }
    checkedInFilter = query.checked_in === "true";
  }

  const filters = { ...query, checked_in: checkedInFilter };
  const orders = await findAll(filters);

  if (orders.length < 1) {
    throw new AppError("NO_DATA", "Orders not found", 404);
  }

  const limit = Number(query.limit || 12);
  const currentPage = Number(query.page || 1);

  const totalData = await totalCount(filters);
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
  req: Request<{ uuid: string }>,
  res: Response<IOrderDetailResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  const user = req.userPayload;
  if (!user) {
    throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
  }
  if (user.role !== "admin") {
    const owner = await findOrderOwner(uuid);
    if (!owner || owner.user_uuid !== user.uuid) {
      throw new AppError("NOT_FOUND", "Order not found", 404);
    }
  }
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
  res: Response<ICreateOrderResponse>,
  next: NextFunction,
) => {
  const body = req.body;

  const user = req.userPayload;
  try {

    const result = await createOrderService(body, user?.uuid);
    if (!result) {
      throw new AppError("CREATE_FAILED", "Failed to create order", 500);
    }

    return res.status(201).json({
      success: true,
      message: "Create order successfully",
      results: result,
    });
  } catch (error) {
    next(error);
  }
};

export const checkInOrder = async (
  req: Request<{ uuid: string }>,
  res: Response<IOrderResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  const user = req.userPayload;

  if (!user) {
    throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
  }

  const chekcedInOrder = await checkInService(uuid, user.uuid);

  return res.status(200).json({
    success: true,
    message: "Check-in order successfully",
    results: [chekcedInOrder],
  });
}