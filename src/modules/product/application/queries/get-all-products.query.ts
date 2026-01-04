import type { ProductResponseDto } from "../dtos/product-response.dto.js";
import type { BaseQuery } from "@shared/types";

import { inject, injectable } from "tsyringe";

import { ProductMapper } from "../../infrastructure/product.mapper.js";
import { ProductRepository } from "../../infrastructure/product.repository.js";

@injectable()
export class GetAllProductsQuery implements BaseQuery<
  undefined,
  ProductResponseDto[]
> {
  constructor(
    @inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<ProductResponseDto[]> {
    const entities = await this.productRepository.findAll();

    return ProductMapper.fromEntitiesToDtos(entities);
  }
}
