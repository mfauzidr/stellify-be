import { Router } from "express";
import {
  createMember,
  deactivateMember,
  deleteMember,
  getAllMembers,
  getDetailMember,
  restoreMember,
  updateMember,
} from "./members.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { singleUploader } from "src/middlewares/upload.middleware";

const membersRouter = Router();

membersRouter.get("/", getAllMembers);
membersRouter.get("/:uuid", getDetailMember);
membersRouter.post(
  "/",
  authMiddleware(["admin"]),
  singleUploader("image"),
  createMember,
);
membersRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  singleUploader("image"),
  updateMember,
);
membersRouter.delete("/:uuid", authMiddleware(["admin"]), deleteMember);
membersRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateMember,
);
membersRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreMember);
export default membersRouter;
