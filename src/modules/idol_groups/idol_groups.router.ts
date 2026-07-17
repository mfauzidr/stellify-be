import {Router} from "express";
import { createIdolGroup, deactivateIdolGroup, deleteIdolGroup, getAllIdolGroups, getIdolGroupByUuid, restoreIdolGroup, updateIdolGroup } from "./idol_groups.handler";

const idolGroupsRouter = Router();

idolGroupsRouter.get("/", getAllIdolGroups);
idolGroupsRouter.get("/:uuid", getIdolGroupByUuid);
idolGroupsRouter.post("/", createIdolGroup);
idolGroupsRouter.patch("/:uuid", updateIdolGroup);
idolGroupsRouter.delete("/:uuid", deleteIdolGroup);
idolGroupsRouter.patch("/:uuid/deactivate", deactivateIdolGroup);
idolGroupsRouter.patch("/:uuid/restore", restoreIdolGroup);

export default idolGroupsRouter;