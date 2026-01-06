import { container } from "tsyringe";

import { LowDbClient } from "@infra/db";
import {
  CreateOrderCommand,
  DiscountCalculatorService,
  LocationPricingService,
  OrderPricingService,
  OrderRepository,
  SeasonalDiscountStrategy,
  VolumeDiscountStrategy,
} from "@modules/order";
import {
  CreateProductCommand,
  GetAllProductsQuery,
  ProductRepository,
  ProductStockService,
  RestockProductCommand,
  SellProductCommand,
} from "@modules/product";
import { DISCOUNT_STRATEGY } from "@shared/di";
import { logger } from "@shared/logger";

export function registerDIContainers() {
  container.registerSingleton(LowDbClient);
  container.registerSingleton(ProductRepository);
  container.registerSingleton(OrderRepository);

  container.registerSingleton(ProductStockService);

  container.register(DISCOUNT_STRATEGY, {
    useClass: VolumeDiscountStrategy,
  });

  container.register(DISCOUNT_STRATEGY, {
    useClass: SeasonalDiscountStrategy,
  });

  container.registerSingleton(DiscountCalculatorService);

  container.registerSingleton(LocationPricingService);
  container.registerSingleton(OrderPricingService);

  container.register(CreateProductCommand, { useClass: CreateProductCommand });
  container.register(RestockProductCommand, {
    useClass: RestockProductCommand,
  });
  container.register(SellProductCommand, { useClass: SellProductCommand });
  container.register(CreateOrderCommand, { useClass: CreateOrderCommand });

  container.register(GetAllProductsQuery, { useClass: GetAllProductsQuery });

  logger.info("DI containers registration completed");
}
