import type { Product } from "../domain/product.entity.js";

import { inject, injectable } from "tsyringe";

import { LowDbClient } from "@infra/db";

import { ProductMapper } from "./product.mapper.js";

@injectable()
export class ProductRepository {
  constructor(@inject(LowDbClient) private readonly client: LowDbClient) {}

  public async save(entity: Product): Promise<void> {
    const record = ProductMapper.fromEntityToRecord(entity);

    await this.client.update(({ products }) => products.push(record));
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
}
