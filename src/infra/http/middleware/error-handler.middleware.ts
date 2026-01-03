import type { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";

import { HttpError } from "@shared/error";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      type: "validation_error",
      message: "Invalid request data",
      errors: err.flatten().fieldErrors,
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      type: "http_error",
      message: err.message,
      details: err.details,
    });
  }

  res.status(500).json({
    type: "server_error",
    message: "Internal Server Error",
  });
}
