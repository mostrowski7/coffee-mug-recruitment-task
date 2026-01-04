import type { SellProductInput } from "../../interfaces/schema/sell-product.schema.js";
import type { BaseCommand } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { NotFoundError } from "@shared/error";

import { ProductRepository } from "../../infrastructure/product.repository.js";

@injectable()
export class SellProductCommand implements BaseCommand<SellProductInput, void> {
  constructor(
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: SellProductInput): Promise<void> {
    const { id, amount } = input;

    const product = await this.productRepository.findOneById(id);

    if (!product) throw new NotFoundError("Product not found");

    product.sell(amount);

    await this.productRepository.update(product);
  }
}
