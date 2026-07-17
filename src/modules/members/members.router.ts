import {Router} from "express";
import { createMember, deactivateMember, deleteMember, getAllMembers, getDetailMember, restoreMember, updateMember} from "./members.handler";


const membersRouter = Router();

membersRouter.get("/", getAllMembers);
membersRouter.get("/:uuid", getDetailMember);
membersRouter.post("/", createMember);
membersRouter.patch("/:uuid", updateMember);
membersRouter.delete("/:uuid", deleteMember);
membersRouter.patch("/:uuid/deactivate", deactivateMember);
membersRouter.patch("/:uuid/restore", restoreMember);
export default membersRouter;
