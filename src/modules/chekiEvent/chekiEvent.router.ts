import { Router } from "express";
import { createChekiEvent, getChekiEvent, updateChekiEvent } from "./chekiEvent.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { singleUploader } from "src/middlewares/upload.middleware";

const chekiEventRouter = Router();

chekiEventRouter.get("/:uuid", getChekiEvent);
chekiEventRouter.post(
  "/",
  authMiddleware(["admin"]),
  singleUploader("banner"),
  createChekiEvent,
);
chekiEventRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  singleUploader("banner"),
  updateChekiEvent,
);

export default chekiEventRouter;
