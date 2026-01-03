import { container } from "tsyringe";

import { LowDbClient } from "@infra/db";
import { logger } from "@shared/logger";

export function registerDIContainers() {
  container.registerSingleton(LowDbClient);

  logger.info("DI containers registration completed");
}
