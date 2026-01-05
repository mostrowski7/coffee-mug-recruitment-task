import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import { Product, ProductRepository } from "@modules/product";
import { ProductFactory } from "@modules/product";
import { NotFoundError, ValidationError } from "@shared/error";

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
      const input = OrderFactory.buildCreateOrderInput({
        items: [{ id: product1.id, quantity: 3 }],
      });

      const initialStock = product1.stock;

      await command.execute(input);

      expect(product1.stock).toBe(initialStock - 3);
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
});
