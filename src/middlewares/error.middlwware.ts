import { isMidtransError } from "src/shared/helper/midtransError";
import { AppError } from "../../src/shared/helper/appError";
import { handlePgError } from "../../src/shared/helper/handlePgError";
import { logger } from "../../src/shared/logger/logger";
import { NextFunction, Request, Response } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error({
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack,
    httpStatusCode: err.httpStatusCode,
    apiResponse: err.ApiResponse,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (isMidtransError(err)) {
    return res.status(err.httpStatusCode).json({
      success: false,
      message: err.ApiResponse?.error_messages?.[0] ?? err.message,
    });
  }

  if (err.code) {
    return handlePgError(err, res);
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
