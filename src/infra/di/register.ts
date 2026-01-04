import { container } from "tsyringe";

import { LowDbClient } from "@infra/db";
import {
  CreateProductCommand,
  GetAllProductsQuery,
  ProductRepository,
  RestockProductCommand,
  SellProductCommand,
} from "@modules/product";
import { logger } from "@shared/logger";

export function registerDIContainers() {
  container.registerSingleton(LowDbClient);
  container.registerSingleton(ProductRepository);

  container.register(CreateProductCommand, { useClass: CreateProductCommand });
  container.register(RestockProductCommand, {
    useClass: RestockProductCommand,
  });
  container.register(SellProductCommand, { useClass: SellProductCommand });

  container.register(GetAllProductsQuery, { useClass: GetAllProductsQuery });

  logger.info("DI containers registration completed");
}
