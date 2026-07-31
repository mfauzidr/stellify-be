import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { updateManualPayment } from "./payments.handler";

const paymentsRouter = Router();

paymentsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  updateManualPayment,
);

export default paymentsRouter;