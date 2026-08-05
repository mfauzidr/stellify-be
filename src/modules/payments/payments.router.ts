import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { updateManualPayment, notification } from "./payments.handler";

const paymentsRouter = Router();

paymentsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  updateManualPayment,
);
paymentsRouter.post(
  "/midtrans/notification",
  notification,
);

export default paymentsRouter;

