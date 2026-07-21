import { Router } from "express";
import { login, registerUser } from "./auth.handler";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", registerUser);

export default authRouter;