import type { CreateProductInput } from "../../interfaces/create-product.schema.js";

import { Product } from "../../domain/product.entity.js";

export class ProductFactory {
  static buildProduct(config: Partial<Product> = {}): Product {
    return new Product(
      config.id ?? "prod_1",
      config.name ?? "Test product",
      config.description ?? "Test description",
      config.price ?? 10,
      config.stock ?? 5,
    );
  }

  static buildCreateProductInput(
    config: Partial<CreateProductInput> = {},
  ): CreateProductInput {
    return {
      name: "Test product",
      description: "Test description",
      price: 10,
      stock: 5,
      ...config,
    };
  }
}
