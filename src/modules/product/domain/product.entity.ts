import type { CreateProductInput } from "../interfaces/schema/create-product.schema.js";

import { randomUUID } from "crypto";

import { ValidationError } from "@shared/error";

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public stock: number,
  ) {}

  public static create(input: CreateProductInput): Product {
    const { name, description, price, stock } = input;

    if (price <= 0) throw new ValidationError("Price must be positive");

    if (stock < 0) throw new ValidationError("Stock cannot be negative");

    return new Product(randomUUID(), name, description, price, stock);
  }

  public restock(amount: number): void {
    if (amount <= 0) {
      throw new ValidationError("Restock quantity must be positive");
    }

    this.stock += amount;
  }

  public sell(quantity: number): void {
    this.decreaseStock(quantity);
  }

  public reserve(quantity: number): void {
    this.decreaseStock(quantity);
  }

  private decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new ValidationError("Quantity must be positive");
    }

    if (quantity > this.stock) {
      throw new ValidationError("Insufficient stock");
    }

    this.stock -= quantity;
  }
}
