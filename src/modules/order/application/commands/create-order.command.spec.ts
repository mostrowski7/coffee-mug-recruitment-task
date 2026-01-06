import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import {
  Product,
  ProductRepository,
  ProductStockService,
} from "@modules/product";
import { ProductFactory } from "@modules/product";
import { DISCOUNT_STRATEGY } from "@shared/di";
import { NotFoundError, ValidationError } from "@shared/error";

import { DiscountCalculatorService } from "../../domain/services/discount-calculator.service.js";
import { LocationPricingService } from "../../domain/services/location-pricing.service.js";
import { OrderPricingService } from "../../domain/services/order-pricing.service.js";
import { SeasonalDiscountStrategy } from "../../domain/strategies/seasonal-discount.strategy.js";
import { VolumeDiscountStrategy } from "../../domain/strategies/volume-discount.strategy.js";
import { getBlackFridayDate } from "../../domain/utils/discount-date.util.js";
import { OrderRepository } from "../../infrastructure/order.repository.js";
import { OrderFactory } from "../../tests/factories/order.factory.js";
import { CreateOrderCommand } from "./create-order.command.js";

describe("CreateOrderCommand", () => {
  let testContainer: DependencyContainer;
  let command: CreateOrderCommand;
  let orderRepository: MockProxy<OrderRepository>;
  let productRepository: MockProxy<ProductRepository>;
  let product1: Product;
  let product2: Product;

  beforeEach(() => {
    testContainer = container.createChildContainer();

    orderRepository = mock<OrderRepository>();
    productRepository = mock<ProductRepository>();

    testContainer.registerInstance(OrderRepository, orderRepository);
    testContainer.registerInstance(ProductRepository, productRepository);

    testContainer.register(DISCOUNT_STRATEGY, {
      useClass: VolumeDiscountStrategy,
    });

    testContainer.register(DISCOUNT_STRATEGY, {
      useClass: SeasonalDiscountStrategy,
    });

    testContainer.register(ProductStockService, {
      useClass: ProductStockService,
    });
    testContainer.register(OrderPricingService, {
      useClass: OrderPricingService,
    });
    testContainer.register(LocationPricingService, {
      useClass: LocationPricingService,
    });
    testContainer.register(DiscountCalculatorService, {
      useClass: DiscountCalculatorService,
    });

    command = testContainer.resolve(CreateOrderCommand);

    product1 = ProductFactory.buildProduct({
      id: "550e8400-e29b-41d4-a716-446655440001",
      stock: 10,
    });
    product2 = ProductFactory.buildProduct({
      id: "550e8400-e29b-41d4-a716-446655440002",
      stock: 5,
    });

    productRepository.findByIdsOrThrow.mockResolvedValue([product1]);
    productRepository.updateMany.mockResolvedValue(undefined);
    orderRepository.save.mockResolvedValue(undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 10));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Success Cases", () => {
    it("should create order with single product", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 2 }],
      });

      await expect(command.execute(input)).resolves.toBeUndefined();

      expect(
        productRepository.findByIdsOrThrow,
      ).toHaveBeenCalledExactlyOnceWith([product1.id]);
      expect(productRepository.updateMany).toHaveBeenCalledExactlyOnceWith([
        product1,
      ]);
      expect(orderRepository.save).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          id: expect.any(String),
          customerId: input.customerId,
          items: input.items,
        }),
      );
    });

    it("should create order with multiple products", async () => {
      productRepository.findByIdsOrThrow.mockResolvedValue([
        product1,
        product2,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [
          { id: product1.id, quantity: 3 },
          { id: product2.id, quantity: 2 },
        ],
      });

      await expect(command.execute(input)).resolves.toBeUndefined();

      expect(
        productRepository.findByIdsOrThrow,
      ).toHaveBeenCalledExactlyOnceWith([product1.id, product2.id]);
      expect(productRepository.updateMany).toHaveBeenCalledExactlyOnceWith([
        product1,
        product2,
      ]);
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it("should reduce stock correctly", async () => {
      const orderQuantity = 3;
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: orderQuantity }],
      });

      const initialStock = product1.stock;

      await command.execute(input);

      expect(product1.stock).toBe(initialStock - orderQuantity);
    });
  });

  describe("Product Not Found", () => {
    it("should throw NotFoundError if product does not exist", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: "non-existent-product-id", quantity: 1 }],
      });

      productRepository.findByIdsOrThrow.mockRejectedValueOnce(
        new NotFoundError(`Products not found: non-existent-product-id`),
      );

      await expect(command.execute(input)).rejects.toThrow(NotFoundError);

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundError if one of multiple products does not exist", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [
          { id: product1.id, quantity: 2 },
          { id: "non-existent-id", quantity: 1 },
        ],
      });

      productRepository.findByIdsOrThrow.mockRejectedValueOnce(
        new NotFoundError("Products not found: non-existent-id"),
      );

      await expect(command.execute(input)).rejects.toThrow(NotFoundError);

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Insufficient Stock", () => {
    it("should throw ValidationError if stock is insufficient", async () => {
      const productWithLowStock = ProductFactory.buildProduct({
        id: product1.id,
        stock: 2,
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        productWithLowStock,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 10 }],
      });

      await expect(command.execute(input)).rejects.toThrow(
        new ValidationError("Insufficient stock"),
      );

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if one product has insufficient stock", async () => {
      const productWithLowStock = ProductFactory.buildProduct({
        id: product2.id,
        stock: 1,
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        product1,
        productWithLowStock,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [
          { id: product1.id, quantity: 2 },
          { id: product2.id, quantity: 5 },
        ],
      });

      await expect(command.execute(input)).rejects.toThrow(
        new ValidationError("Insufficient stock"),
      );

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it("should not save order if stock check fails", async () => {
      const productWithZeroStock = ProductFactory.buildProduct({
        id: product1.id,
        stock: 0,
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        productWithZeroStock,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 1 }],
      });

      await expect(command.execute(input)).rejects.toThrow(ValidationError);

      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Validation Errors", () => {
    it("should throw ValidationError if quantity is missing for a product", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 2 }],
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        product1,
        product2,
      ]);

      await expect(command.execute(input)).rejects.toThrow(
        new ValidationError(`Missing quantity for product ${product2.id}`),
      );

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if quantity is zero", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 0 }],
      });

      await expect(command.execute(input)).rejects.toThrow(
        new ValidationError(
          `Quantity must be positive for product ${product1.id}`,
        ),
      );

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });

    it("should throw ValidationError if quantity is negative", async () => {
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: -5 }],
      });

      await expect(command.execute(input)).rejects.toThrow(
        new ValidationError(
          `Quantity must be positive for product ${product1.id}`,
        ),
      );

      expect(productRepository.updateMany).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle order with exact available stock", async () => {
      const productWithExactStock = ProductFactory.buildProduct({
        id: product1.id,
        stock: 5,
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        productWithExactStock,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 5 }],
      });

      await expect(command.execute(input)).resolves.toBeUndefined();

      expect(productWithExactStock.stock).toBe(0);
      expect(productRepository.updateMany).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it("should handle large quantity orders", async () => {
      const productWithLargeStock = ProductFactory.buildProduct({
        id: product1.id,
        stock: 1000,
      });

      productRepository.findByIdsOrThrow.mockResolvedValue([
        productWithLargeStock,
      ]);

      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 999 }],
      });

      await expect(command.execute(input)).resolves.toBeUndefined();

      expect(productWithLargeStock.stock).toBe(1);
      expect(productRepository.updateMany).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
    });
  });

  describe("Discount Calculation", () => {
    describe("Volume Discounts", () => {
      it("should apply 10% discount for 5-9 units", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 5 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 450,
          }),
        );
      });

      it("should apply 20% discount for 10-49 units", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 10 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 800,
          }),
        );
      });

      it("should apply 30% discount for 50+ units", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 50 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 3500,
          }),
        );
      });

      it("should not apply volume discount for less than 5 units", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 4 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 400,
          }),
        );
      });
    });

    describe("Seasonal Discounts", () => {
      it("should apply 25% Black Friday discount", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const blackFriday = getBlackFridayDate(2026);
        vi.setSystemTime(blackFriday);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 150,
          }),
        );
      });

      it("should apply 15% holiday discount on Polish bank holiday", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        vi.setSystemTime(new Date(2026, 0, 6));

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 170,
          }),
        );
      });

      it("should apply Black Friday discount over holiday discount when both apply", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const blackFriday = getBlackFridayDate(2026);
        vi.setSystemTime(blackFriday);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 150,
          }),
        );
      });

      it("should combine seasonal discount with location pricing", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const blackFriday = getBlackFridayDate(2026);
        vi.setSystemTime(blackFriday);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "EU",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 172.5,
          }),
        );
      });
    });

    describe("Location Pricing", () => {
      it("should apply standard pricing for US customers", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 200,
          }),
        );
      });

      it("should apply 15% price increase for EU customers (VAT)", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "EU",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 230,
          }),
        );
      });

      it("should apply 5% discount for ASIA customers", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "ASIA",
          items: [{ id: product1.id, quantity: 2 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 190,
          }),
        );
      });
    });

    describe("Discount Priority - Highest Wins", () => {
      it("should apply volume discount over location pricing when volume is better", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "ASIA",
          items: [{ id: product1.id, quantity: 10 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 760,
          }),
        );
      });

      it("should apply volume discount over EU price increase", async () => {
        const productWithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          productWithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "EU",
          items: [{ id: product1.id, quantity: 50 }],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 4025,
          }),
        );
      });
    });

    describe("Multiple Products", () => {
      it("should calculate total correctly for multiple products with different discounts", async () => {
        const product1WithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        const product2WithPrice = ProductFactory.buildProduct({
          id: product2.id,
          price: 50,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          product1WithPrice,
          product2WithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "US",
          items: [
            { id: product1.id, quantity: 10 },
            { id: product2.id, quantity: 2 },
          ],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 900,
          }),
        );
      });

      it("should apply different discounts per item based on quantity", async () => {
        const product1WithPrice = ProductFactory.buildProduct({
          id: product1.id,
          price: 100,
          stock: 100,
        });

        const product2WithPrice = ProductFactory.buildProduct({
          id: product2.id,
          price: 200,
          stock: 100,
        });

        productRepository.findByIdsOrThrow.mockResolvedValue([
          product1WithPrice,
          product2WithPrice,
        ]);

        const input = OrderFactory.buildCreateOrderInput({
          customerLocation: "ASIA",
          items: [
            { id: product1.id, quantity: 4 },
            { id: product2.id, quantity: 5 },
          ],
        });

        await command.execute(input);

        expect(orderRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            total: 1235,
          }),
        );
      });
    });
  });
});
