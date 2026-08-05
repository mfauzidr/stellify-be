import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { updateManualPayment, notification, syncPaymentStatus, cancelPayment, expirePayment } from "./payments.handler";

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
paymentsRouter.patch("/:uuid/sync", authMiddleware(["admin"]), syncPaymentStatus);
paymentsRouter.post(
  "/:uuid/cancel",
  authMiddleware(["admin"]),
  cancelPayment,
);

paymentsRouter.post(
  "/:uuid/expire",
  authMiddleware(["admin"]),
  expirePayment,
);

export default paymentsRouter;

