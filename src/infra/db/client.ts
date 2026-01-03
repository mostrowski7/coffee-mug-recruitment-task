import path from "node:path";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { injectable } from "tsyringe";

export interface LowDbSchema {
  products: unknown[];
  orders: unknown[];
}

const DEFAULT_DATA: LowDbSchema = { products: [], orders: [] };

@injectable()
export class LowDbClient {
  private readonly db: Low<LowDbSchema>;

  constructor() {
    const filePath = path.join(process.cwd(), "db.json");
    const adapter = new JSONFile<LowDbSchema>(filePath);
    this.db = new Low<LowDbSchema>(adapter, DEFAULT_DATA);
  }

  async init(): Promise<void> {
    await this.db.read();
    this.db.data ||= DEFAULT_DATA;
    await this.db.write();
  }

  data(): LowDbSchema {
    if (!this.db.data) {
      throw new Error("DbClient not initialized");
    }
    return this.db.data;
  }

  async update(fn: (data: LowDbSchema) => void): Promise<void> {
    await this.db.update(fn);
  }
}
