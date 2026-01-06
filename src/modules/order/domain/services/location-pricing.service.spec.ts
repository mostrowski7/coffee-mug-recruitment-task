import { LocationPricingService } from "./location-pricing.service.js";

describe("LocationPricingService", () => {
  const service = new LocationPricingService();

  describe("applyLocationPricing", () => {
    it("should return same price for US location", () => {
      const finalPrice = service.applyLocationPricing(100, "US");
      expect(finalPrice).toBe(100);
    });

    it("should increase price by 15% for EU location", () => {
      const finalPrice = service.applyLocationPricing(100, "EU");
      expect(finalPrice).toBe(115);
    });

    it("should decrease price by 5% for ASIA location", () => {
      const finalPrice = service.applyLocationPricing(100, "ASIA");
      expect(finalPrice).toBe(95);
    });

    it("should handle decimal prices correctly", () => {
      const finalPrice = service.applyLocationPricing(99.99, "EU");
      expect(finalPrice).toBeCloseTo(114.9885, 2);
    });

    it("should apply EU pricing after discount", () => {
      const priceAfterDiscount = 80;
      const finalPrice = service.applyLocationPricing(priceAfterDiscount, "EU");
      expect(finalPrice).toBe(92);
    });
  });
});
