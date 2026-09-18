import { Request, Response } from "express";
import {
  IDashboardCheckInResponse,
  IDashboardEventOverviewResponse,
  IDashboardOrderPhaseResponse,
  IDashboardPaymentResponse,
  IDashboardResponse,
} from "src/shared/models/response.model";
import {
  getCheckInOverview,
  getEventOverview,
  getOrderPhaseOverview,
  getPaymentOverview,
  getSummary,
} from "./dashboard.service";

export const getDashboardSummary = async (
  req: Request,
  res: Response<IDashboardResponse>,
): Promise<Response> => {
  const summary = await getSummary();

  return res.status(200).json({
    success: true,
    message: "Dashboard summary retrieved successfully",
    results: summary,
  });
};

export const getDashboardPaymentOverview = async (
  req: Request,
  res: Response<IDashboardPaymentResponse>,
): Promise<Response> => {
  const paymentOverview = await getPaymentOverview();

  return res.status(200).json({
    success: true,
    message: "Dashboard payment overview retrieved successfully",
    results: paymentOverview,
  });
};

export const getDashboardCheckInOverview = async (
  req: Request,
  res: Response<IDashboardCheckInResponse>,
): Promise<Response> => {
  const checkInOverview = await getCheckInOverview();

  return res.status(200).json({
    success: true,
    message: "Dashboard check-in overview retrieved successfully",
    results: checkInOverview,
  });
};

export const getDashboardOrderPhaseOverview = async (
  req: Request,
  res: Response<IDashboardOrderPhaseResponse>,
): Promise<Response> => {
  const orderPhaseOverview = await getOrderPhaseOverview();

  return res.status(200).json({
    success: true,
    message: "Dashboard order phase overview retrieved successfully",
    results: orderPhaseOverview,
  });
};

export const getDashboardEventOverview = async (
  req: Request,
  res: Response<IDashboardEventOverviewResponse>,
): Promise<Response> => {
  const eventOverview = await getEventOverview();

  return res.status(200).json({
    success: true,
    message: "Dashboard event overview retrieved successfully",
    results: eventOverview,
  });
};