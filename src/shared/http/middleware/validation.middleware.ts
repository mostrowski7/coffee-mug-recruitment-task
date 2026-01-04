import type { RequestHandler } from "express";
import type { ParsedQs } from "qs";

import z from "zod";

type ValidationLocals = Record<string, unknown>;

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  const middleware: RequestHandler<
    Record<string, unknown>,
    unknown,
    z.infer<T>,
    ParsedQs,
    ValidationLocals
  > = (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
  return middleware;
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  const middleware: RequestHandler<
    Record<string, unknown>,
    unknown,
    unknown,
    ParsedQs,
    ValidationLocals
  > = (req, res, next) => {
    try {
      res.locals.query = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
  return middleware;
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  const middleware: RequestHandler<
    Record<string, unknown>,
    unknown,
    unknown,
    ParsedQs,
    ValidationLocals
  > = (req, res, next) => {
    try {
      res.locals.params = schema.parse(req.params);
      next();
    } catch (error) {
      next(error);
    }
  };
  return middleware;
}
