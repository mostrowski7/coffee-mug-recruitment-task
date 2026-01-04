import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import { ConflictError, ValidationError } from "@shared/error";

import { ProductRepository } from "../../infrastructure/product.repository.js";
import { ProductFactory } from "../../tests/factories/product.factory.js";
import { CreateProductCommand } from "./create-product.command.js";

describe("CreateProductCommand", () => {
  let testContainer: DependencyContainer;
  let command: CreateProductCommand;
  let repository: MockProxy<ProductRepository>;

  beforeEach(() => {
    testContainer = container.createChildContainer();

    repository = mock<ProductRepository>();
    testContainer.registerInstance(ProductRepository, repository);

    command = testContainer.resolve(CreateProductCommand);

    repository.findOneByName.mockResolvedValue(null);
  });

  it("should throw ConflictError if product already exists", async () => {
    const input = ProductFactory.buildCreateProductInput();
    const existingProduct = ProductFactory.buildProduct({
      name: input.name,
    });

    repository.findOneByName.mockResolvedValueOnce(existingProduct);

    await expect(command.execute(input)).rejects.toThrow(
      new ConflictError("Product already exists"),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if price is negative", async () => {
    const inputWithNegativePrice = ProductFactory.buildCreateProductInput({
      price: -100,
    });

    await expect(command.execute(inputWithNegativePrice)).rejects.toThrow(
      new ValidationError("Price cannot be negative"),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("should throw ValidationError if stock is negative", async () => {
    const inputWithNegativeStock = ProductFactory.buildCreateProductInput({
      stock: -100,
    });

    await expect(command.execute(inputWithNegativeStock)).rejects.toThrow(
      new ValidationError("Stock cannot be negative"),
    );

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("should create new product", async () => {
    const input = ProductFactory.buildCreateProductInput();

    await expect(command.execute(input)).resolves.toBeUndefined();

    expect(repository.findOneByName).toHaveBeenCalledExactlyOnceWith(
      input.name,
    );

    expect(repository.save).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        id: expect.any(String),
        name: input.name,
        description: input.description,
        price: input.price,
        stock: input.stock,
      }),
    );
  });
});
