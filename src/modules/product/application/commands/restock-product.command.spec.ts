import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import { NotFoundError, ValidationError } from "@shared/error";

import { ProductRepository } from "../../infrastructure/product.repository.js";
import { ProductFactory } from "../../tests/factories/product.factory.js";
import { RestockProductCommand } from "./restock-product.command.js";

describe("RestockProductCommand", () => {
  let testContainer: DependencyContainer;
  let command: RestockProductCommand;
  let repository: MockProxy<ProductRepository>;

  const product = ProductFactory.buildProduct();
  const input = ProductFactory.buildRestockProductInput();

  beforeEach(() => {
    testContainer = container.createChildContainer();

    repository = mock<ProductRepository>();
    testContainer.registerInstance(ProductRepository, repository);

    command = testContainer.resolve(RestockProductCommand);

    repository.findOneById.mockResolvedValue(product);
  });

  it("should throw NotFoundError if product does not exist", async () => {
    repository.findOneById.mockResolvedValueOnce(null);

    await expect(command.execute(input)).rejects.toThrow(
      new NotFoundError("Product not found"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if amount to add is negative", async () => {
    const inputWithNegativeAmount = ProductFactory.buildRestockProductInput({
      amount: -1,
    });

    await expect(command.execute(inputWithNegativeAmount)).rejects.toThrow(
      new ValidationError("Restock quantity must be positive"),
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("should restock product", async () => {
    await expect(command.execute(input)).resolves.toBeUndefined();

    expect(repository.findOneById).toHaveBeenCalledExactlyOnceWith(input.id);

    expect(repository.update).toHaveBeenCalledExactlyOnceWith(product);
  });
});
