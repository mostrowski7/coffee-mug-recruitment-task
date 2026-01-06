import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import { NotFoundError, ValidationError } from "@shared/error";

import { ProductRepository } from "../../infrastructure/product.repository.js";
import { ProductFactory } from "../../tests/factories/product.factory.js";
import { SellProductCommand } from "./sell-product.command.js";

describe("SellProductCommand", () => {
  let testContainer: DependencyContainer;
  let command: SellProductCommand;
  let repository: MockProxy<ProductRepository>;

  const product = ProductFactory.buildProduct({ stock: 5 });
  const input = ProductFactory.buildSellProductInput({ quantity: 2 });

  beforeEach(() => {
    testContainer = container.createChildContainer();

    repository = mock<ProductRepository>();
    testContainer.registerInstance(ProductRepository, repository);

    command = testContainer.resolve(SellProductCommand);

    repository.findOneById.mockResolvedValue(product);
  });

  it("should throw NotFoundError if product does not exist", async () => {
    repository.findOneById.mockResolvedValueOnce(null);

    await expect(command.execute(input)).rejects.toThrow(
      new NotFoundError("Product not found"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if quantity to sell is negative", async () => {
    const inputWithNegativeQuantity = ProductFactory.buildSellProductInput({
      quantity: -1,
    });

    await expect(command.execute(inputWithNegativeQuantity)).rejects.toThrow(
      new ValidationError("Quantity must be positive"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if quantity exceeds stock", async () => {
    const inputExceedingStock = ProductFactory.buildSellProductInput({
      quantity: 999,
    });

    await expect(command.execute(inputExceedingStock)).rejects.toThrow(
      new ValidationError("Insufficient stock"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should sell product", async () => {
    await expect(command.execute(input)).resolves.toBeUndefined();

    expect(repository.findOneById).toHaveBeenCalledExactlyOnceWith(input.id);

    expect(repository.update).toHaveBeenCalledExactlyOnceWith(product);
  });
});
