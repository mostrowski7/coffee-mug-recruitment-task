import type { CreateProductInput } from "../../interface/schema/create-product.schema.js";
import type { RestockProductInput } from "../../interface/schema/restock-product.schema.js";
import type { SellProductInput } from "../../interface/schema/sell-product.schema.js";

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

  static buildRestockProductInput(
    config: Partial<RestockProductInput> = {},
  ): RestockProductInput {
    return {
      id: "uuid",
      quantity: 1,
      ...config,
    };
  }

  static buildSellProductInput(
    config: Partial<SellProductInput> = {},
  ): SellProductInput {
    return {
      id: "uuid",
      quantity: 1,
      ...config,
    };
  }
}
