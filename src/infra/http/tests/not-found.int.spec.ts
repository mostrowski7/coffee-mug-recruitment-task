import type { Application } from "express";

import request from "supertest";

import { createTestApp } from "@tests/utils";

describe("Not Found Handler", () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe("404 Handler", () => {
    it("should return 404 for undefined routes", async () => {
      const res = await request(app).get("/api/undefined-route");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Resource not found");
      expect(res.body).toHaveProperty("path", "/api/undefined-route");
    });

    it("should return 404 for non-existent nested routes", async () => {
      const res = await request(app).get("/api/products/invalid/nested/route");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Resource not found");
      expect(res.body).toHaveProperty(
        "path",
        "/api/products/invalid/nested/route",
      );
    });

    it("should return 404 for routes outside /api", async () => {
      const res = await request(app).get("/random-path");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("message", "Resource not found");
      expect(res.body).toHaveProperty("path", "/random-path");
    });
  });
});
