import { Router } from "express";
import { createCheki, deactivateCheki, deleteCheki, getAllCheki, getChekiByUuid, restoreCheki, updateCheki } from "./cheki.handler";


const chekiRouter = Router();

chekiRouter.get("/", getAllCheki);
chekiRouter.get("/:uuid", getChekiByUuid);
chekiRouter.post("/", createCheki);
chekiRouter.patch("/:uuid", updateCheki);
chekiRouter.delete("/:uuid", deleteCheki);
chekiRouter.patch("/deactivate/:uuid", deactivateCheki);
chekiRouter.patch("/restore/:uuid", restoreCheki);

export default chekiRouter;