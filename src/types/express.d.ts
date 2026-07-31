import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends JwtPayload {
      uuid: string;
      role: "admin" | "user";
      email: string;
    }

    interface Request {
      user: User;
    }
  }
}

export {};