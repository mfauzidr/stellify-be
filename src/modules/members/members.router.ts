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

const membersRouter = Router();

membersRouter.get("/", getAllMembers);
membersRouter.get("/:uuid", getDetailMember);
membersRouter.post("/", authMiddleware(["admin"]), createMember);
membersRouter.patch("/:uuid", authMiddleware(["admin"]), updateMember);
membersRouter.delete("/:uuid", authMiddleware(["admin"]), deleteMember);
membersRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateMember,
);
membersRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreMember);
export default membersRouter;
