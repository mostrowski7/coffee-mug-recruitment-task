import { DiscountContextFactory } from "../../tests/factories/discount-context.factory.js";
import { VolumeDiscountStrategy } from "./volume-discount.strategy.js";

describe("VolumeDiscountStrategy", () => {
  const strategy = new VolumeDiscountStrategy();

  it("should return 30% discount for 50+ units", () => {
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 50 }),
      ),
    ).toBe(0.3);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 100 }),
      ),
    ).toBe(0.3);
  });

  it("should return 20% discount for 10-49 units", () => {
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 10 }),
      ),
    ).toBe(0.2);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 25 }),
      ),
    ).toBe(0.2);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 49 }),
      ),
    ).toBe(0.2);
  });

  it("should return 10% discount for 5-9 units", () => {
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 5 }),
      ),
    ).toBe(0.1);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 7 }),
      ),
    ).toBe(0.1);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 9 }),
      ),
    ).toBe(0.1);
  });

  it("should return 0% discount for less than 5 units", () => {
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 1 }),
      ),
    ).toBe(0);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 4 }),
      ),
    ).toBe(0);
  });

  it("should handle edge case at boundary values", () => {
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 4 }),
      ),
    ).toBe(0);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 5 }),
      ),
    ).toBe(0.1);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 9 }),
      ),
    ).toBe(0.1);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 10 }),
      ),
    ).toBe(0.2);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 49 }),
      ),
    ).toBe(0.2);
    expect(
      strategy.calculate(
        DiscountContextFactory.buildDiscountContext({ quantity: 50 }),
      ),
    ).toBe(0.3);
  });
});
