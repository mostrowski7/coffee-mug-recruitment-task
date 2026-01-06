import type {
  DiscountContext,
  DiscountStrategy,
} from "../types/discount.type.js";

import { Decimal } from "decimal.js";
import { injectable, injectAll } from "tsyringe";

import { DISCOUNT_STRATEGY } from "@shared/di";

@injectable()
export class DiscountCalculatorService {
  constructor(
    @injectAll(DISCOUNT_STRATEGY)
    private readonly strategies: DiscountStrategy[],
  ) {}

  public getHighestDiscount(context: DiscountContext): number {
    const discounts = this.strategies.map((strategy) =>
      strategy.calculate(context),
    );

    return Math.max(0, ...discounts);
  }

  public calculateFinalPrice(
    basePrice: number,
    context: DiscountContext,
  ): number {
    const discount = this.getHighestDiscount(context);
    const price = new Decimal(basePrice);
    const discountMultiplier = new Decimal(1).minus(discount);

    return price.times(discountMultiplier).toNumber();
  }
}
