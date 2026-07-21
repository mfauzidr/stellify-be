import { Router } from "express";
import {
  createCheki,
  deactivateCheki,
  deleteCheki,
  getAllCheki,
  getChekiByUuid,
  restoreCheki,
  updateCheki,
} from "./cheki.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";

const chekiRouter = Router();

chekiRouter.get("/", getAllCheki);
chekiRouter.get("/:uuid", getChekiByUuid);
chekiRouter.post("/", authMiddleware(["admin"]), createCheki);
chekiRouter.patch("/:uuid", authMiddleware(["admin"]), updateCheki);
chekiRouter.delete("/:uuid", authMiddleware(["admin"]), deleteCheki);
chekiRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateCheki,
);
chekiRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreCheki);

export default chekiRouter;
