import type { DiscountContext } from "../types/discount.type.js";

import { SeasonalDiscountStrategy } from "../strategies/seasonal-discount.strategy.js";
import { VolumeDiscountStrategy } from "../strategies/volume-discount.strategy.js";
import { getBlackFridayDate } from "../utils/discount-date.util.js";
import { DiscountCalculatorService } from "./discount-calculator.service.js";

describe("DiscountCalculatorService", () => {
  const strategies = [
    new VolumeDiscountStrategy(),
    new SeasonalDiscountStrategy(),
  ];
  const calculator = new DiscountCalculatorService(strategies);

  describe("getHighestDiscount", () => {
    it("should return volume discount when it is highest", () => {
      const context: DiscountContext = {
        quantity: 50,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      expect(calculator.getHighestDiscount(context)).toBe(0.3);
    });

    it("should return Black Friday discount when it is highest", () => {
      const blackFriday = getBlackFridayDate(2024);
      const context: DiscountContext = {
        quantity: 4,
        date: blackFriday,
        location: "US",
      };

      expect(calculator.getHighestDiscount(context)).toBe(0.25);
    });

    it("should return volume discount when both apply", () => {
      const context: DiscountContext = {
        quantity: 10,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      expect(calculator.getHighestDiscount(context)).toBe(0.2);
    });

    it("should return 0 when no discounts apply", () => {
      const context: DiscountContext = {
        quantity: 2,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      expect(calculator.getHighestDiscount(context)).toBe(0);
    });
  });

  describe("calculateFinalPrice", () => {
    it("should calculate final price with volume discount", () => {
      const context: DiscountContext = {
        quantity: 10,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      const finalPrice = calculator.calculateFinalPrice(100, context);
      expect(finalPrice).toBe(80);
    });

    it("should calculate final price with Black Friday discount", () => {
      const blackFriday = getBlackFridayDate(2024);
      const context: DiscountContext = {
        quantity: 2,
        date: blackFriday,
        location: "US",
      };

      const finalPrice = calculator.calculateFinalPrice(200, context);
      expect(finalPrice).toBe(150);
    });

    it("should calculate final price with no discount", () => {
      const context: DiscountContext = {
        quantity: 2,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      const finalPrice = calculator.calculateFinalPrice(100, context);
      expect(finalPrice).toBe(100);
    });

    it("should handle decimal prices correctly", () => {
      const context: DiscountContext = {
        quantity: 10,
        date: new Date(2024, 5, 15),
        location: "US",
      };

      const finalPrice = calculator.calculateFinalPrice(99.99, context);
      expect(finalPrice).toBeCloseTo(79.99, 2);
    });
  });
});
