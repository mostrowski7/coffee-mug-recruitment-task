import type { Order } from "../domain/order.entity.js";
import type { OrderRecord } from "@infra/db";

export class OrderMapper {
  public static fromEntityToRecord(entity: Order): OrderRecord {
    return {
      id: entity.id,
      customerId: entity.customerId,
      items: entity.items,
      total: entity.total,
    };
  }
}
