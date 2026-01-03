import "reflect-metadata";

import { initializeDatabase } from "@infra/db";
import { env } from "@shared/config";
import { logger } from "@shared/logger";

import { registerDIContainers } from "../di/register.js";
import { createApp } from "./app.js";

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught exception, shutting down");
  process.exit(1);
});

async function bootstrap() {
  registerDIContainers();

  await initializeDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Server listening on PORT: ${env.port}`);
  });
}

bootstrap().catch((err) => {
  logger.fatal(err, "Failed to bootstrap server");
  process.exit(1);
});
