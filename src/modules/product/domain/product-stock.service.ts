import type { Product } from "./product.entity.js";
import type {
  ProductQuantity,
  ProductReservation,
} from "./types/product-stock.type.js";

import { injectable } from "tsyringe";

import { ValidationError } from "@shared/error";

@injectable()
export class ProductStockService {
  public reserve(products: Product[], items: ProductQuantity[]): void {
    const productQuantities = this.getValidatedProductQuantities(
      products,
      items,
    );

    for (const { product, quantity } of productQuantities) {
      product.reserve(quantity);
    }
  }

  private getValidatedProductQuantities(
    products: Product[],
    items: ProductQuantity[],
  ): ProductReservation[] {
    const quantityMap = this.buildProductQuantityMap(items);

    return products.map((product) => {
      const quantity = quantityMap.get(product.id);

      if (quantity === undefined) {
        throw new ValidationError(`Missing quantity for product ${product.id}`);
      }

      if (quantity <= 0) {
        throw new ValidationError(
          `Quantity must be positive for product ${product.id}`,
        );
      }

      return {
        product,
        quantity,
      };
    });
  }

  private buildProductQuantityMap(
    items: ProductQuantity[],
  ): Map<string, number> {
    return new Map(items.map((item) => [item.id, item.quantity]));
  }
}
