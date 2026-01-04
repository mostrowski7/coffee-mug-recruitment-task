import type { CreateProductInput } from "../../interfaces/schema/create-product.schema.js";
import type { BaseCommand } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { ConflictError } from "@shared/error";

import { Product } from "../../domain/product.entity.js";
import { ProductRepository } from "../../infrastructure/product.repository.js";

@injectable()
export class CreateProductCommand implements BaseCommand<
  CreateProductInput,
  void
> {
  constructor(
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateProductInput) {
    const existing = await this.productRepository.findOneByName(input.name);

    if (existing) throw new ConflictError("Product already exists");

    const product = Product.create(input);

    await this.productRepository.save(product);
  }
}
