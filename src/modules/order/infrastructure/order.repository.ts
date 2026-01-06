import type { Order } from "../domain/order.entity.js";

import { inject, injectable } from "tsyringe";

import { LowDbClient } from "@infra/db";

import { OrderMapper } from "./order.mapper.js";

@injectable()
export class OrderRepository {
  constructor(@inject(LowDbClient) private readonly client: LowDbClient) {}

  public async save(entity: Order): Promise<void> {
    const record = OrderMapper.fromEntityToRecord(entity);

    await this.client.update(({ orders }) => orders.push(record));
  }
}
