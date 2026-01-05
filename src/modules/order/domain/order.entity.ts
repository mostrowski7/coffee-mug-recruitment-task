import type { CreateOrderInput } from "../interface/schema/create-order.schema.js";
import type { OrderItem } from "./order-item.entity.js";

import { randomUUID } from "crypto";

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
  ) {}

  static create(input: CreateOrderInput): Order {
    return new Order(randomUUID(), input.customerId, input.items);
  }
}
