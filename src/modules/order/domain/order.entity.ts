import type { OrderItem } from "./order-item.entity.js";

import { randomUUID } from "crypto";

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly total: number,
  ) {}

  static create(customerId: string, items: OrderItem[], total: number): Order {
    return new Order(randomUUID(), customerId, items, total);
  }
}
