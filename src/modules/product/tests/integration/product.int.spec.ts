import type { Application } from "express";

import request from "supertest";

import { createTestApp } from "@tests/utils";

import { ProductFactory } from "../factories/product.factory.js";

describe("Product API endpoints", () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const input = ProductFactory.buildCreateProductInput();

      const res = await request(app).post("/api/products").send(input);

      expect(res.status).toBe(201);
    });

    it("should return conflict if product already exists", async () => {
      const input = ProductFactory.buildCreateProductInput();

      await request(app).post("/api/products").send(input);

      const res = await request(app).post("/api/products").send(input);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Product already exists");
    });

    it("should return validation error if price is negative", async () => {
      const input = ProductFactory.buildCreateProductInput({ price: -10 });

      const res = await request(app).post("/api/products").send(input);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid request data");
    });

    it("should return validation error if stock is negative", async () => {
      const input = ProductFactory.buildCreateProductInput({ stock: -5 });

      const res = await request(app).post("/api/products").send(input);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid request data");
    });
  });
});
