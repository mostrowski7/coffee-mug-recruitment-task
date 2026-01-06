import type { CreateOrderInput } from "../../interface/schema/create-order.schema.js";
import type { BaseCommand } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { ProductRepository, ProductStockService } from "@modules/product";

import { Order } from "../../domain/order.entity.js";
import { OrderPricingService } from "../../domain/services/order-pricing.service.js";
import { OrderRepository } from "../../infrastructure/order.repository.js";

@injectable()
export class CreateOrderCommand implements BaseCommand<CreateOrderInput, void> {
  constructor(
    @inject(OrderRepository) private readonly orderRepository: OrderRepository,
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @inject(ProductStockService)
    private readonly productStockService: ProductStockService,
    @inject(OrderPricingService)
    private readonly orderPricingService: OrderPricingService,
  ) {}

  public async execute(input: CreateOrderInput): Promise<void> {
    const { items, customerId, customerLocation } = input;

    const productIds = items.map((item) => item.id);
    const products = await this.productRepository.findByIdsOrThrow(productIds);

    this.productStockService.reserve(products, items);

    const total = this.orderPricingService.calculateOrderTotal({
      products,
      items,
      location: customerLocation,
    });

    const order = Order.create(customerId, items, total);

    await this.productRepository.updateMany(products);

    await this.orderRepository.save(order);
  }
}
