import type { ProductResponseDto } from "../application/dtos/product-response.dto.js";
import type { ProductRecord } from "@infra/db";

import { Product } from "../domain/product.entity.js";

export class ProductMapper {
  public static fromRecordToEntity(record: ProductRecord): Product {
    return new Product(
      record.id,
      record.name,
      record.description,
      record.price,
      record.stock,
    );
  }

  public static fromEntityToRecord(entity: Product): ProductRecord {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      stock: entity.stock,
    };
  }

  public static fromEntityToDto(entity: Product): ProductResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      stock: entity.stock,
    };
  }

  public static fromRecordsToEntities(records: ProductRecord[]): Product[] {
    return records.map(this.fromRecordToEntity);
  }

  public static fromEntitiesToDtos(entities: Product[]): ProductResponseDto[] {
    return entities.map(this.fromEntityToDto);
  }
}
