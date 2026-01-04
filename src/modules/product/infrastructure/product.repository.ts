import type { Product } from "../domain/product.entity.js";

import { inject, injectable } from "tsyringe";

import { LowDbClient } from "@infra/db";
import { NotFoundError } from "@shared/error";

import { ProductMapper } from "./product.mapper.js";

@injectable()
export class ProductRepository {
  constructor(@inject(LowDbClient) private readonly client: LowDbClient) {}

  public async save(entity: Product): Promise<void> {
    const record = ProductMapper.fromEntityToRecord(entity);

    await this.client.update(({ products }) => products.push(record));
  }

  public async update(product: Product): Promise<void> {
    const record = ProductMapper.fromEntityToRecord(product);

    await this.client.update(({ products }) => {
      const index = products.findIndex((p) => p.id === record.id);

      if (index === -1) throw new NotFoundError("Product not found");

      products[index] = product;
    });
  }

  public async findOneByName(name: string): Promise<Product | null> {
    const normalizedName = name.trim().toLowerCase();

    const { products } = await this.client.data();
    const product = products.find(
      (product) => product.name.trim().toLowerCase() === normalizedName,
    );

    if (!product) return null;

    return ProductMapper.fromRecordToEntity(product);
  }

  public async findOneById(id: string): Promise<Product | null> {
    const { products } = await this.client.data();

    const product = products.find((product) => product.id === id);

    if (!product) return null;

    return ProductMapper.fromRecordToEntity(product);
  }

  public async findAll(): Promise<Product[]> {
    const { products } = await this.client.data();

    return ProductMapper.fromRecordsToEntities(products);
  }
}
