import { Router } from "express";
import {
  createEvents,
  deactivateEvent,
  deleteEvent,
  getAllEvents,
  getEventsByUuid,
  restoreEvent,
  updateEvent,
} from "./events.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { singleUploader } from "src/middlewares/upload.middleware";

const eventsRouter = Router();

eventsRouter.get("/", getAllEvents);
eventsRouter.get("/:uuid", getEventsByUuid);
eventsRouter.post(
  "/",
  authMiddleware(["admin"]),
  singleUploader("banner"),
  createEvents,
);
eventsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  singleUploader("banner"),
  updateEvent,
);
eventsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteEvent);
eventsRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateEvent,
);
eventsRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreEvent);
export default eventsRouter;
