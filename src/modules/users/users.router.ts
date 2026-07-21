import { Router } from "express";
import { createUsers, deactivateUsers, getAllUsers, getDetailUser, restoreUsers, updateUsers } from "./users.handler";

const usersRouter = Router();

usersRouter.get("/", getAllUsers);
usersRouter.get("/:uuid", getDetailUser);
usersRouter.post("/", createUsers);
usersRouter.patch("/:uuid", updateUsers);
usersRouter.patch("/deactivate/:uuid", deactivateUsers);
usersRouter.patch("/restore/:uuid",  restoreUsers);

export default usersRouter;
