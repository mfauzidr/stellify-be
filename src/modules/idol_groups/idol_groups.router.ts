import { Router } from "express";
import {
  createIdolGroup,
  deactivateIdolGroup,
  deleteIdolGroup,
  getAllIdolGroups,
  getIdolGroupByUuid,
  restoreIdolGroup,
  updateIdolGroup,
} from "./idol_groups.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { multiFieldUploader } from "src/middlewares/upload.middleware";

const idolGroupsRouter = Router();

idolGroupsRouter.get("/", getAllIdolGroups);
idolGroupsRouter.get("/:uuid", getIdolGroupByUuid);
idolGroupsRouter.post(
  "/",
  authMiddleware(["admin"]),
  multiFieldUploader([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createIdolGroup,
);
idolGroupsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  multiFieldUploader([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateIdolGroup,
);
idolGroupsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteIdolGroup);
idolGroupsRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateIdolGroup,
);
idolGroupsRouter.patch(
  "/restore/:uuid",
  authMiddleware(["admin"]),
  restoreIdolGroup,
);

export default idolGroupsRouter;
