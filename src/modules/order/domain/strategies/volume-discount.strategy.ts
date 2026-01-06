import type {
  DiscountContext,
  DiscountStrategy,
} from "../types/discount.type.js";

import { injectable } from "tsyringe";

@injectable()
export class VolumeDiscountStrategy implements DiscountStrategy {
  calculate(context: DiscountContext): number {
    const { quantity } = context;

    if (quantity >= 50) return 0.3;

    if (quantity >= 10) return 0.2;

    if (quantity >= 5) return 0.1;

    return 0;
  }
}
