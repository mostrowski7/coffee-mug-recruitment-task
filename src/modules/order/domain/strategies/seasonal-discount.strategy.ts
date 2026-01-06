import type {
  DiscountContext,
  DiscountStrategy,
} from "../types/discount.type.js";

import { injectable } from "tsyringe";

import { isBlackFriday, isHoliday } from "../utils/discount-date.util.js";

@injectable()
export class SeasonalDiscountStrategy implements DiscountStrategy {
  calculate(context: DiscountContext): number {
    const { date } = context;

    if (isBlackFriday(date)) return 0.25;

    if (isHoliday(date)) return 0.15;

    return 0;
  }
}
