import type { DiscountContext } from "../types/discount.type.js";
import type {
  CalculateItemTotalInput,
  CalculateOrderTotalInput,
} from "../types/order.type.js";

import { Decimal } from "decimal.js";
import { inject, injectable } from "tsyringe";

import { NotFoundError } from "@shared/error";

import { DiscountCalculatorService } from "./discount-calculator.service.js";
import { LocationPricingService } from "./location-pricing.service.js";

@injectable()
export class OrderPricingService {
  constructor(
    @inject(DiscountCalculatorService)
    private readonly discountCalculator: DiscountCalculatorService,
    @inject(LocationPricingService)
    private readonly locationPricing: LocationPricingService,
  ) {}

  public calculateOrderTotal(input: CalculateOrderTotalInput): number {
    const { products, items, location, orderDate = new Date() } = input;

    const total = items.reduce((total, item) => {
      const product = this.findProductById(products, item.id);
      const itemTotal = this.calculateItemTotal({
        product,
        quantity: item.quantity,
        location,
        orderDate,
      });

      return total.plus(itemTotal);
    }, new Decimal(0));

    return total.toNumber();
  }

  private calculateItemTotal(input: CalculateItemTotalInput): number {
    const { product, quantity, location, orderDate } = input;

    const context: DiscountContext = { quantity, date: orderDate, location };

    const priceAfterDiscount = this.discountCalculator.calculateFinalPrice(
      product.price,
      context,
    );

    const priceAfterLocation = this.locationPricing.applyLocationPricing(
      priceAfterDiscount,
      location,
    );

    return new Decimal(priceAfterLocation).times(quantity).toNumber();
  }

  private findProductById(
    products: CalculateOrderTotalInput["products"],
    productId: string,
  ): CalculateOrderTotalInput["products"][number] {
    const product = products.find((p) => p.id === productId);

    if (!product) {
      throw new NotFoundError(`Product ${productId} not found`);
    }

    return product;
  }
}
