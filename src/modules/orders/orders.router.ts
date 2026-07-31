import { Router } from "express";
import { createOrder, getAllOrders, getDetailOrder } from "./orders.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";


const ordersRouter = Router();

ordersRouter.get("/", authMiddleware(["admin","user"]), getAllOrders);
ordersRouter.get("/:uuid", getDetailOrder);
ordersRouter.post("/", createOrder)

export default ordersRouter;