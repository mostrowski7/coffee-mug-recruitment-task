import type { DependencyContainer } from "tsyringe";
import type { MockProxy } from "vitest-mock-extended";

import { container } from "tsyringe";
import { mock } from "vitest-mock-extended";

import { ProductMapper } from "../../infrastructure/product.mapper.js";
import { ProductRepository } from "../../infrastructure/product.repository.js";
import { ProductFactory } from "../../tests/factories/product.factory.js";
import { GetAllProductsQuery } from "./get-all-products.query.js";

describe("GetAllProductsQuery", () => {
  let testContainer: DependencyContainer;
  let query: GetAllProductsQuery;
  let repository: MockProxy<ProductRepository>;

  beforeEach(() => {
    testContainer = container.createChildContainer();

    repository = mock<ProductRepository>();
    testContainer.registerInstance(ProductRepository, repository);

    query = testContainer.resolve(GetAllProductsQuery);
  });

  it("should return all products", async () => {
    const entities = [
      ProductFactory.buildProduct({ name: "Product 1" }),
      ProductFactory.buildProduct({ name: "Product 2" }),
      ProductFactory.buildProduct({ name: "Product 3" }),
    ];

    repository.findAll.mockResolvedValueOnce(entities);

    const result = await query.execute();

    const expectedDtos = ProductMapper.fromEntitiesToDtos(entities);

    expect(result.length).toBe(3);
    expect(result).toEqual(expectedDtos);
  });
});
