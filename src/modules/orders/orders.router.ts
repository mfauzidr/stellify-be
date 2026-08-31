import { Router } from "express";
import { checkInOrder, createOrder, getAllOrders, getDetailOrder } from "./orders.handler";
import { authMiddleware, optionalAuthMiddleware } from "src/middlewares/auth.middleware";


const ordersRouter = Router();

ordersRouter.get("/", authMiddleware(["admin","user"]), getAllOrders);
ordersRouter.get("/:uuid", authMiddleware(["admin","user"]), getDetailOrder);
ordersRouter.post("/", optionalAuthMiddleware, createOrder)
ordersRouter.patch("/:uuid/check-in", authMiddleware(["admin"]), checkInOrder)

export default ordersRouter;