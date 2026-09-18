import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import {
  getDashboardCheckInOverview,
  getDashboardEventOverview,
  getDashboardOrderPhaseOverview,
  getDashboardPaymentOverview,
  getDashboardSummary,
} from "./dashboard.handler";

const dashboardRouter = Router();

dashboardRouter.get("/summary", authMiddleware(["admin"]), getDashboardSummary);
dashboardRouter.get(
  "/payment-overview",
  authMiddleware(["admin"]),
  getDashboardPaymentOverview,
);
dashboardRouter.get(
  "/check-in-overview",
  authMiddleware(["admin"]),
  getDashboardCheckInOverview,
);
dashboardRouter.get(
  "/order-phase-overview",
  authMiddleware(["admin"]),
  getDashboardOrderPhaseOverview,
);
dashboardRouter.get(
  "/event-overview",
  authMiddleware(["admin"]),
  getDashboardEventOverview,
);

export default dashboardRouter;
