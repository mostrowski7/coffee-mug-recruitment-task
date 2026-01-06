import type { Application } from "express";

import request from "supertest";

import { createTestApp } from "@tests/utils";

describe("Health Check Endpoint", () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe("GET /api/health", () => {
    it("should return 200 and health status", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("timestamp");
      expect(new Date(res.body.timestamp).getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });
  });
});
