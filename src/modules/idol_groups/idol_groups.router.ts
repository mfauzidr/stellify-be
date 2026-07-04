import {Router} from "express";
import { createIdolGroup, getAllIdolGroups, getIdolGroupByUuid } from "./idol_groups.handler";

const idolGroupsRouter = Router();

idolGroupsRouter.get("/", getAllIdolGroups);
idolGroupsRouter.get("/:uuid", getIdolGroupByUuid);
idolGroupsRouter.post("/", createIdolGroup);

export default idolGroupsRouter;