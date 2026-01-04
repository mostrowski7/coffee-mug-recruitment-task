import type { RequestHandler } from "express";
import type { ParsedQs } from "qs";

import z from "zod";

type EmptyParams = Record<string, never>;
type EmptyLocals = Record<string, never>;

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  const middleware: RequestHandler<
    EmptyParams,
    unknown,
    z.infer<T>,
    ParsedQs,
    EmptyLocals
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
    EmptyParams,
    unknown,
    unknown,
    ParsedQs,
    { query: z.infer<T> }
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
    EmptyParams,
    unknown,
    unknown,
    ParsedQs,
    { params: z.infer<T> }
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
