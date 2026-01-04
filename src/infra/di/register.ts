import { container } from "tsyringe";

import { LowDbClient } from "@infra/db";
import { CreateProductCommand, ProductRepository } from "@modules/product";
import { logger } from "@shared/logger";

export function registerDIContainers() {
  container.registerSingleton(LowDbClient);
  container.registerSingleton(ProductRepository);

  container.register(CreateProductCommand, { useClass: CreateProductCommand });

  logger.info("DI containers registration completed");
}
