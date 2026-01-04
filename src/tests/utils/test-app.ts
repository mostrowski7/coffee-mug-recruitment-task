import type { Application } from "express";

import { container } from "tsyringe";

import { clearDatabase, initializeDatabase } from "@infra/db";
import { registerDIContainers } from "@infra/di";
import { createApp } from "@infra/http";

export async function createTestApp(): Promise<Application> {
  container.reset();

  registerDIContainers();

  await initializeDatabase();

  await clearDatabase();

  return createApp();
}
