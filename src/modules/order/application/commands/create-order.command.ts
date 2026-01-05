import type { CreateOrderInput } from "../../interface/schema/create-order.schema.js";
import type { BaseCommand } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { ProductRepository, ProductStockService } from "@modules/product";

import { OrderRepository } from "../../../order/infrastructure/order.repository.js";
import { Order } from "../../domain/order.entity.js";

@injectable()
export class CreateOrderCommand implements BaseCommand<CreateOrderInput, void> {
  constructor(
    @inject(OrderRepository) private readonly orderRepository: OrderRepository,
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
    @inject(ProductStockService)
    private readonly productStockService: ProductStockService,
  ) {}

  public async execute(input: CreateOrderInput): Promise<void> {
    const productIds = input.items.map((item) => item.id);
    const products = await this.productRepository.findByIdsOrThrow(productIds);

    this.productStockService.reserve(products, input.items);
    await this.productRepository.updateMany(products);

    const order = Order.create(input);
    await this.orderRepository.save(order);
  }
}
