import pino from "pino";

import { env } from "@config";

export const logger = pino({
  level: env.nodeEnv === "production" ? "info" : "debug",
  ...(env.nodeEnv !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      }
    : {}),
});
