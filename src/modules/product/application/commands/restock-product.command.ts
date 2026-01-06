import type { RestockProductInput } from "../../interface/schema/restock-product.schema.js";
import type { BaseCommand } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { NotFoundError } from "@shared/error";

import { ProductRepository } from "../../infrastructure/product.repository.js";

@injectable()
export class RestockProductCommand implements BaseCommand<
  RestockProductInput,
  void
> {
  constructor(
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: RestockProductInput): Promise<void> {
    const { id, quantity } = input;

    const product = await this.productRepository.findOneById(id);

    if (!product) throw new NotFoundError("Product not found");

    product.restock(quantity);

    await this.productRepository.update(product);
  }
}
