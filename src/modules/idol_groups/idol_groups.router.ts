import {Router} from "express";
import { createIdolGroup, deactivateIdolGroup, deleteIdolGroup, getAllIdolGroups, getIdolGroupByUuid, restoreIdolGroup, updateIdolGroup } from "./idol_groups.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";

const idolGroupsRouter = Router();

idolGroupsRouter.get("/", getAllIdolGroups);
idolGroupsRouter.get("/:uuid", getIdolGroupByUuid);
idolGroupsRouter.post("/", authMiddleware(["admin"]), createIdolGroup);
idolGroupsRouter.patch("/:uuid", authMiddleware(["admin"]), updateIdolGroup);
idolGroupsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteIdolGroup);
idolGroupsRouter.patch("/deactivate/:uuid", authMiddleware(["admin"]), deactivateIdolGroup);
idolGroupsRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreIdolGroup);

export default idolGroupsRouter;