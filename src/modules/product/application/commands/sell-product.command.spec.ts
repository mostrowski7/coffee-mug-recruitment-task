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
  const input = ProductFactory.buildSellProductInput({ amount: 2 });

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

  it("should throw ValidationError if amount to sell is negative", async () => {
    const inputWithNegativeAmount = ProductFactory.buildSellProductInput({
      amount: -1,
    });

    await expect(command.execute(inputWithNegativeAmount)).rejects.toThrow(
      new ValidationError("Sell amount must be positive"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if amount exceeds stock", async () => {
    const inputExceedingStock = ProductFactory.buildSellProductInput({
      amount: 999,
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
