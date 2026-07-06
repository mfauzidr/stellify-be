import {Router} from "express";
import { createMember, deleteMember, getAllMembers, getDetailMember, updateMember} from "./members.handler";


const router = Router();

router.get("/", getAllMembers);
router.get("/:uuid", getDetailMember);
router.post("/", createMember);
router.patch("/:uuid", updateMember);
router.delete("/:uuid", deleteMember);
export default router;
