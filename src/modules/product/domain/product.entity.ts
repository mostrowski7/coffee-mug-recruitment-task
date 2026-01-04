import type { CreateProductInput } from "../interfaces/create-product.schema.js";

import { randomUUID } from "crypto";

import { ValidationError } from "@shared/error";

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
  ) {}

  public static create(input: CreateProductInput): Product {
    const { name, description, price, stock } = input;

    if (price < 0) throw new ValidationError("Price cannot be negative");

    if (stock < 0) throw new ValidationError("Stock cannot be negative");

    return new Product(randomUUID(), name, description, price, stock);
  }
}
