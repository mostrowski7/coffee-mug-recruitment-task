import { container } from "tsyringe";

import { logger } from "@shared/logger";

import { LowDbClient } from "./client.js";

export async function initializeDatabase(): Promise<void> {
  const client = container.resolve(LowDbClient);
  await client.init();

  logger.info("Database initialized");
}
