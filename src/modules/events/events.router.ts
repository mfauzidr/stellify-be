import { Router } from "express";
import { createEvents, deactivateEvent, deleteEvent, getAllEvents, getEventsByUuid, restoreEvent, updateEvent } from "./events.handler";


const eventsRouter = Router();

eventsRouter.get("/", getAllEvents)
eventsRouter.get("/:uuid", getEventsByUuid)
eventsRouter.post("/", createEvents)
eventsRouter.patch("/:uuid", updateEvent)
eventsRouter.delete("/:uuid", deleteEvent)
eventsRouter.patch("/deactivate/:uuid", deactivateEvent)
eventsRouter.patch("/restore/:uuid", restoreEvent)
export default eventsRouter