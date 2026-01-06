import { DiscountContextFactory } from "../../tests/factories/discount-context.factory.js";
import {
  getBlackFridayDate,
  getHolidays,
} from "../utils/discount-date.util.js";
import { SeasonalDiscountStrategy } from "./seasonal-discount.strategy.js";

describe("SeasonalDiscountStrategy", () => {
  const strategy = new SeasonalDiscountStrategy();

  describe("Black Friday", () => {
    it("should return 25% discount on Black Friday 2024", () => {
      const blackFriday2024 = getBlackFridayDate(2024);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: blackFriday2024,
          }),
        ),
      ).toBe(0.25);
    });

    it("should return 25% discount on Black Friday 2025", () => {
      const blackFriday2025 = getBlackFridayDate(2025);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: blackFriday2025,
          }),
        ),
      ).toBe(0.25);
    });

    it("should return 0% discount on day before Black Friday", () => {
      const blackFriday = getBlackFridayDate(2024);
      const dayBefore = new Date(blackFriday);
      dayBefore.setDate(dayBefore.getDate() - 1);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: dayBefore }),
        ),
      ).toBe(0);
    });

    it("should return 0% discount on day after Black Friday", () => {
      const blackFriday = getBlackFridayDate(2024);
      const dayAfter = new Date(blackFriday);
      dayAfter.setDate(dayAfter.getDate() + 1);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: dayAfter }),
        ),
      ).toBe(0);
    });
  });

  describe("Polish Bank Holidays", () => {
    it("should return 15% discount on New Year's Day", () => {
      const newYearsDay = new Date(2024, 0, 1);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: newYearsDay }),
        ),
      ).toBe(0.15);
    });

    it("should return 15% discount on Epiphany", () => {
      const epiphany = new Date(2024, 0, 6);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: epiphany }),
        ),
      ).toBe(0.15);
    });

    it("should return 15% discount on Labour Day", () => {
      const labourDay = new Date(2024, 4, 1);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: labourDay }),
        ),
      ).toBe(0.15);
    });

    it("should return 15% discount on Constitution Day", () => {
      const constitutionDay = new Date(2024, 4, 3);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: constitutionDay,
          }),
        ),
      ).toBe(0.15);
    });

    it("should return 15% discount on Independence Day", () => {
      const independenceDay = new Date(2024, 10, 11);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: independenceDay,
          }),
        ),
      ).toBe(0.15);
    });

    it("should return 15% discount on Christmas", () => {
      const christmas = new Date(2024, 11, 25);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: christmas }),
        ),
      ).toBe(0.15);
    });
  });

  describe("Regular Days", () => {
    it("should return 0% discount on regular day", () => {
      const regularDay = new Date(2024, 5, 15);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({ date: regularDay }),
        ),
      ).toBe(0);
    });

    it("should return 0% discount on various regular days", () => {
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: new Date(2024, 2, 10),
          }),
        ),
      ).toBe(0);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: new Date(2024, 6, 20),
          }),
        ),
      ).toBe(0);
      expect(
        strategy.calculate(
          DiscountContextFactory.buildDiscountContext({
            date: new Date(2024, 8, 5),
          }),
        ),
      ).toBe(0);
    });
  });

  describe("All Bank Holidays", () => {
    it("should return 15% discount for all Polish bank holidays", () => {
      const holidays2024 = getHolidays(2024);

      holidays2024.forEach((holiday) => {
        expect(
          strategy.calculate(
            DiscountContextFactory.buildDiscountContext({ date: holiday }),
          ),
        ).toBe(0.15);
      });
    });
  });
});
