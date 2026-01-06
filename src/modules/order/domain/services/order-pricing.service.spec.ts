import { ProductFactory } from "@modules/product";
import { NotFoundError } from "@shared/error";

import { SeasonalDiscountStrategy } from "../strategies/seasonal-discount.strategy.js";
import { VolumeDiscountStrategy } from "../strategies/volume-discount.strategy.js";
import { getBlackFridayDate } from "../utils/discount-date.util.js";
import { DiscountCalculatorService } from "./discount-calculator.service.js";
import { LocationPricingService } from "./location-pricing.service.js";
import { OrderPricingService } from "./order-pricing.service.js";

describe("OrderPricingService", () => {
  const strategies = [
    new VolumeDiscountStrategy(),
    new SeasonalDiscountStrategy(),
  ];
  const discountCalculator = new DiscountCalculatorService(strategies);
  const locationPricing = new LocationPricingService();
  const pricingService = new OrderPricingService(
    discountCalculator,
    locationPricing,
  );

  describe("calculateOrderTotal", () => {
    it("should calculate total for single product without discount", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 10 });
      const items = [{ id: product.id, quantity: 2 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "US",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(200);
    });

    it("should calculate total with volume discount", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 100 });
      const items = [{ id: product.id, quantity: 10 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "US",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(800);
    });

    it("should calculate total with Black Friday discount", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 10 });
      const items = [{ id: product.id, quantity: 2 }];
      const blackFriday = getBlackFridayDate(2024);

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "US",
        orderDate: blackFriday,
      });

      expect(total).toBe(150);
    });

    it("should calculate total with EU price increase", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 10 });
      const items = [{ id: product.id, quantity: 2 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "EU",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(230);
    });

    it("should calculate total with ASIA discount", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 10 });
      const items = [{ id: product.id, quantity: 2 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "ASIA",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(190);
    });

    it("should calculate total for multiple products", () => {
      const product1 = ProductFactory.buildProduct({
        id: "product-1",
        price: 100,
        stock: 100,
      });
      const product2 = ProductFactory.buildProduct({
        id: "product-2",
        price: 50,
        stock: 100,
      });
      const items = [
        { id: product1.id, quantity: 10 },
        { id: product2.id, quantity: 2 },
      ];

      const total = pricingService.calculateOrderTotal({
        products: [product1, product2],
        items,
        location: "US",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(900);
    });

    it("should apply different discounts per item based on quantity", () => {
      const product1 = ProductFactory.buildProduct({
        id: "product-1",
        price: 100,
        stock: 100,
      });
      const product2 = ProductFactory.buildProduct({
        id: "product-2",
        price: 200,
        stock: 100,
      });
      const items = [
        { id: product1.id, quantity: 4 },
        { id: product2.id, quantity: 5 },
      ];

      const total = pricingService.calculateOrderTotal({
        products: [product1, product2],
        items,
        location: "ASIA",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBe(1235);
    });

    it("should use current date by default", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 10 });
      const items = [{ id: product.id, quantity: 2 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "US",
      });
      expect(total).toBeGreaterThan(0);
    });

    it("should throw NotFoundError if product not found", () => {
      const product = ProductFactory.buildProduct({
        id: "product-1",
        price: 100,
        stock: 10,
      });
      const items = [{ id: "non-existent-id", quantity: 2 }];

      expect(() =>
        pricingService.calculateOrderTotal({
          products: [product],
          items,
          location: "US",
          orderDate: new Date(2024, 5, 15),
        }),
      ).toThrow(NotFoundError);
    });

    it("should handle decimal prices correctly", () => {
      const product = ProductFactory.buildProduct({
        price: 99.99,
        stock: 100,
      });
      const items = [{ id: product.id, quantity: 10 }];

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "US",
        orderDate: new Date(2024, 5, 15),
      });

      expect(total).toBeCloseTo(799.92, 2);
    });

    it("should calculate correct total with highest discount", () => {
      const product = ProductFactory.buildProduct({ price: 100, stock: 100 });
      const items = [{ id: product.id, quantity: 50 }];
      const blackFriday = getBlackFridayDate(2024);

      const total = pricingService.calculateOrderTotal({
        products: [product],
        items,
        location: "ASIA",
        orderDate: blackFriday,
      });

      expect(total).toBe(3325);
    });
  });
});
