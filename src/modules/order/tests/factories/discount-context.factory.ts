import type { DiscountContext } from "../../domain/types/discount.type.js";

export class DiscountContextFactory {
  static buildDiscountContext(
    overrides: Partial<DiscountContext> = {},
  ): DiscountContext {
    return {
      quantity: 1,
      date: new Date(),
      location: "US",
      ...overrides,
    };
  }
}
