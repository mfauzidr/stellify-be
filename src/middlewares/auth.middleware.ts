import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

import { AppParams } from "../../src/shared/models/params.model";
import { IAuthResponse } from "../../src/shared/models/response.model";
import { IPayload } from "../../src/shared/models/payload.model";

export const jwtSignOptions: SignOptions = {
  expiresIn: "60m",
  issuer: process.env.JWT_ISSUER,
};

export const jwtVerifyOptions: VerifyOptions = {
  issuer: process.env.JWT_ISSUER,
};

export const authMiddleware =
  (roles: string[] = []) =>
  (
    req: Request<AppParams>,
    res: Response<IAuthResponse>,
    next: NextFunction
  ) => {
    const bearerToken = req.header("Authorization");

    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
        err: "Token not found",
      });
    }

    const token = bearerToken.split(" ")[1];

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      jwtVerifyOptions,
      (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: err.message,
            err: err.name,
          });
        }

        const payload = decoded as IPayload;

        if (roles.length && !roles.includes(payload.role)) {
          return res.status(403).json({
            message: "Forbidden",
            err: "Forbidden Access",
          });
        }

        (
          req as Request<AppParams> & {
            userPayload: IPayload;
          }
        ).userPayload = payload;

        next();
      }
    );
  };

export const redirectIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      jwtVerifyOptions
    );

    return res.redirect("/");
  } catch {
    return next();
  }
};