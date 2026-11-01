import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { AppParams } from "../../src/shared/models/params.model";
import { IAuthResponse } from "../../src/shared/models/response.model";
import { IPayload } from "../../src/shared/models/payload.model";
import { findAuthUser } from "src/modules/users/users.repo";

export const jwtSignOptions: SignOptions = {
  expiresIn: "60m",
  issuer: process.env.JWT_ISSUER,
};

export const jwtVerifyOptions: VerifyOptions = {
  issuer: process.env.JWT_ISSUER,
};

export const authMiddleware =
  (roles: string[] = []) =>
  async (
    req: Request<AppParams>,
    res: Response<IAuthResponse>,
    next: NextFunction,
  ) => {
    const bearerToken = req.header("Authorization");

    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
        err: "Token not found",
      });
    }

    const token = bearerToken.split(" ")[1];

    let decoded: jwt.JwtPayload;
    try {
      const verified = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        { ...jwtVerifyOptions, complete: false },
      );
      if (typeof verified === "string") {
        return res.status(401).json({
          message: "Invalid token payload",
          err: "JsonWebTokenError",
        });
      }
      decoded = verified;
    } catch (error) {
      const err = error as Error;
      return res.status(401).json({
        message: err.message,
        err: err.name,
      });
    }

    if (
      typeof decoded.uuid !== "string" ||
      typeof decoded.id !== "number" ||
      typeof decoded.role !== "string"
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
        err: "JsonWebTokenError",
      });
    }

    const user = await findAuthUser(decoded.uuid);
    if (!user?.is_active) {
      return res.status(401).json({
        message: "Unauthorized",
        err: "Account is inactive or no longer exists",
      });
    }

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({
        message: "Forbidden",
        err: "Forbidden Access",
      });
    }

    req.userPayload = { id: decoded.id, uuid: user.uuid, role: user.role };
    return next();
  };

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.headers.authorization;

  if (!bearer?.startsWith("Bearer ")) {
    return next();
  }

  const token = bearer.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      { ...jwtVerifyOptions, complete: false },
    );
    if (
      typeof decoded === "string" ||
      typeof decoded.uuid !== "string" ||
      typeof decoded.id !== "number" ||
      typeof decoded.role !== "string"
    ) {
      return next();
    }
    void findAuthUser(decoded.uuid)
      .then((user) => {
        if (user?.is_active) {
          req.userPayload = {
            id: decoded.id,
            uuid: user.uuid,
            role: user.role,
          };
        }
        return next();
      })
      .catch(next);
  } catch {
    return next();
  }
};

export const redirectIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string, jwtVerifyOptions);

    return res.redirect("/");
  } catch {
    return next();
  }
};
