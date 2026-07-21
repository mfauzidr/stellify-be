import { Router } from "express";
import {
  createUsers,
  deactivateUsers,
  getAllUsers,
  getDetailUser,
  restoreUsers,
  updateUsers,
} from "./users.handler";
import { authMiddleware } from "src/middlewares/auth.middleware";

const usersRouter = Router();

usersRouter.get("/", authMiddleware(["admin"]), getAllUsers);
usersRouter.get("/:uuid", authMiddleware(["admin","user"]), getDetailUser);
usersRouter.post("/", authMiddleware(["admin"]), createUsers);
usersRouter.patch("/:uuid", authMiddleware(["admin", "user"]), updateUsers);
usersRouter.patch(
  "/deactivate/:uuid",
  authMiddleware(["admin"]),
  deactivateUsers,
);
usersRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreUsers);

export default usersRouter;
