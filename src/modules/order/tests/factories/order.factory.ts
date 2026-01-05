import type { CreateOrderInput } from "../../interface/schema/create-order.schema.js";

import { Order } from "../../domain/order.entity.js";
import { OrderItem } from "../../domain/order-item.entity.js";

export class OrderFactory {
  static buildOrder(config: Partial<Order> = {}): Order {
    return new Order(
      config.id ?? "uuid",
      config.customerId ?? "uuid",
      config.items ?? [new OrderItem("Product1", 2)],
    );
  }

  static buildOrderItem(config: Partial<OrderItem> = {}): OrderItem {
    return new OrderItem(config.id ?? "Product1", config.quantity ?? 1);
  }

  static buildCreateOrderInput(
    config: Partial<CreateOrderInput> = {},
  ): CreateOrderInput {
    return {
      customerId: "uuid",
      items: [
        {
          id: "uuid",
          quantity: 2,
        },
      ],
      ...config,
    };
  }
}
