import { container } from "tsyringe";

import { LowDbClient } from "./client.js";

export async function clearDatabase(): Promise<void> {
  const client = container.resolve(LowDbClient);
  await client.clear();
}
