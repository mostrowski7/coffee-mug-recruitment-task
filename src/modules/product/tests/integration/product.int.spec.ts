import type { ProductResponseDto } from "@modules/product";
import type { Application } from "express";

import request from "supertest";

import { clearDatabase } from "@infra/db";
import { createTestApp } from "@tests/utils";

import { ProductFactory } from "../factories/product.factory.js";

describe("Product API endpoints", () => {
  let app: Application;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
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

    it("should return validation error if price is zero", async () => {
      const input = ProductFactory.buildCreateProductInput({ price: 0 });

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

  describe("GET /products", () => {
    it("should return all products", async () => {
      const input1 = ProductFactory.buildCreateProductInput({
        name: "Product 1",
      });
      const input2 = ProductFactory.buildCreateProductInput({
        name: "Product 2",
      });

      await request(app).post("/api/products").send(input1);
      await request(app).post("/api/products").send(input2);

      const res = await request(app).get("/api/products");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("name");
      expect(res.body[0]).toHaveProperty("description");
      expect(res.body[0]).toHaveProperty("price");
      expect(res.body[0]).toHaveProperty("stock");
    });
  });

  describe("POST /products/:id/restock", () => {
    it("should restock product", async () => {
      const initialStock = 5;
      const restockQuantity = 5;
      const input = ProductFactory.buildCreateProductInput({
        name: "Restock target",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(input).expect(201);

      const createdProductRes = await request(app)
        .get("/api/products")
        .expect(200);

      const createdProduct = createdProductRes.body.find(
        (product: ProductResponseDto) => product.name === input.name,
      );

      expect(createdProduct).toBeDefined();
      expect(createdProduct.stock).toBe(initialStock);

      await request(app)
        .post(`/api/products/${createdProduct.id}/restock`)
        .send({ quantity: restockQuantity })
        .expect(204);

      const restockedProductRes = await request(app)
        .get("/api/products")
        .expect(200);

      const updatedProduct = restockedProductRes.body.find(
        (product: ProductResponseDto) => product.id === createdProduct.id,
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.stock).toBe(initialStock + restockQuantity);
    });
  });

  describe("POST /products/:id/sell", () => {
    it("should sell product", async () => {
      const initialStock = 5;
      const sellQuantity = 2;
      const input = ProductFactory.buildCreateProductInput({
        name: "Sell target",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(input).expect(201);

      const createdProductRes = await request(app)
        .get("/api/products")
        .expect(200);

      const createdProduct = createdProductRes.body.find(
        (product: ProductResponseDto) => product.name === input.name,
      );

      expect(createdProduct).toBeDefined();
      expect(createdProduct.stock).toBe(initialStock);

      await request(app)
        .post(`/api/products/${createdProduct.id}/sell`)
        .send({ quantity: sellQuantity })
        .expect(204);

      const updatedRes = await request(app).get("/api/products").expect(200);

      const updatedProduct = updatedRes.body.find(
        (product: ProductResponseDto) => product.id === createdProduct.id,
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.stock).toBe(initialStock - sellQuantity);
    });

    it("should return validation error when selling more than stock", async () => {
      const initialStock = 1;
      const sellQuantity = 2;
      const input = ProductFactory.buildCreateProductInput({
        name: "Sell too much",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(input).expect(201);

      const createdProductRes = await request(app)
        .get("/api/products")
        .expect(200);

      const createdProduct = createdProductRes.body.find(
        (product: ProductResponseDto) => product.name === input.name,
      );

      await request(app)
        .post(`/api/products/${createdProduct.id}/sell`)
        .send({ quantity: sellQuantity })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Insufficient stock");
        });
    });
  });
});
