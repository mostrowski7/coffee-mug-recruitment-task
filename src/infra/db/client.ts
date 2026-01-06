import type { LowDbSchema } from "./schema.js";

import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { injectable } from "tsyringe";

import { env } from "@shared/config";

const DEFAULT_DATA: LowDbSchema = { products: [], orders: [] };

@injectable()
export class LowDbClient {
  private readonly db: Low<LowDbSchema>;

  constructor() {
    const filePath = path.join(process.cwd(), env.dbFileName);
    const adapter = new JSONFile<LowDbSchema>(filePath);
    this.db = new Low<LowDbSchema>(adapter, DEFAULT_DATA);
  }

  async init(): Promise<void> {
    await this.db.read();

    if (!this.db.data) {
      this.db.data = { products: [], orders: [] };
      await this.db.write();
    }
  }

  async clear(): Promise<void> {
    await this.db.read();
    await this.db.update((data) => {
      data.products = [];
      data.orders = [];
    });
  }

  async data(): Promise<LowDbSchema> {
    await this.db.read();

    if (!this.db.data) {
      throw new Error("DbClient not initialized");
    }
    return this.db.data;
  }

  async update(fn: (data: LowDbSchema) => void): Promise<void> {
    await this.db.read();
    await this.db.update(fn);
  }
}
