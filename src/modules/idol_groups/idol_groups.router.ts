import {Router} from "express";
import { createIdolGroup, deleteIdolGroup, getAllIdolGroups, getIdolGroupByUuid, updateIdolGroup } from "./idol_groups.handler";

const idolGroupsRouter = Router();

idolGroupsRouter.get("/", getAllIdolGroups);
idolGroupsRouter.get("/:uuid", getIdolGroupByUuid);
idolGroupsRouter.post("/", createIdolGroup);
idolGroupsRouter.patch("/:uuid", updateIdolGroup);
idolGroupsRouter.delete("/:uuid", deleteIdolGroup);

export default idolGroupsRouter;