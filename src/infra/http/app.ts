import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { env } from "@shared/config";
import { logger } from "@shared/logger";

import { errorHandler } from "./middleware/error-handler.middleware.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(helmet());

  app.use(
    cors({
      origin: env.corsOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    }),
  );

  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMax,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(pinoHttp({ logger }));

  app.use(errorHandler);

  return app;
}
