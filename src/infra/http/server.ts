import { env } from "@config";
import { logger } from "@logger";

import { createApp } from "./app.js";

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught exception, shutting down");
  process.exit(1);
});

async function bootstrap() {
  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Server listening on PORT: ${env.port}`);
  });
}

bootstrap().catch((err) => {
  logger.fatal(err, "Failed to bootstrap server");
  process.exit(1);
});
