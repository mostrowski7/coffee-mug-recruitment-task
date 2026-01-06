import type { ProductResponseDto } from "@modules/product";
import type { Application } from "express";

import request from "supertest";

import { clearDatabase } from "@infra/db";
import { ProductFactory } from "@modules/product";
import { createTestApp } from "@tests/utils";

import { OrderFactory } from "../factories/order.factory.js";

describe("Order API endpoints", () => {
  let app: Application;

  const customerId = "550e8400-e29b-41d4-a716-446655440000";

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("POST /orders", () => {
    it("should create a new order with single product", async () => {
      const productInput = ProductFactory.buildCreateProductInput({
        name: "Test Product",
        stock: 10,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(1);

      const product = products[0];

      expect(product).toBeDefined();

      if (!product) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: product.id, quantity: 2 }],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(201);
    });

    it("should create order with multiple products", async () => {
      const product1Input = ProductFactory.buildCreateProductInput({
        name: "Product 1",
        stock: 10,
      });
      const product2Input = ProductFactory.buildCreateProductInput({
        name: "Product 2",
        stock: 5,
      });

      await request(app).post("/api/products").send(product1Input).expect(201);
      await request(app).post("/api/products").send(product2Input).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(2);

      const product1 = products[0];
      const product2 = products[1];

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();

      if (!product1 || !product2) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [
          { id: product1.id, quantity: 3 },
          { id: product2.id, quantity: 2 },
        ],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(201);
    });

    it("should reduce stock after order is placed", async () => {
      const initialStock = 10;
      const orderQuantity = 3;

      const productInput = ProductFactory.buildCreateProductInput({
        name: "Stock Test Product",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(1);

      const product = products[0];

      expect(product).toBeDefined();

      if (!product) return;

      expect(product.stock).toBe(initialStock);

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: product.id, quantity: orderQuantity }],
      });

      await request(app).post("/api/orders").send(orderInput).expect(201);

      const updatedProductsRes = await request(app)
        .get("/api/products")
        .expect(200);

      const updatedProducts = updatedProductsRes.body as ProductResponseDto[];

      expect(updatedProducts).toHaveLength(1);

      const updatedProduct = updatedProducts[0];

      expect(updatedProduct).toBeDefined();

      if (!updatedProduct) return;

      expect(updatedProduct.stock).toBe(initialStock - orderQuantity);
    });

    it("should reduce stock for multiple products", async () => {
      const product1Input = ProductFactory.buildCreateProductInput({
        name: "Multi Product 1",
        stock: 10,
      });
      const product2Input = ProductFactory.buildCreateProductInput({
        name: "Multi Product 2",
        stock: 8,
      });

      await request(app).post("/api/products").send(product1Input).expect(201);
      await request(app).post("/api/products").send(product2Input).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);

      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(2);

      const product1 = products[0];
      const product2 = products[1];

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();

      if (!product1 || !product2) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [
          { id: product1.id, quantity: 4 },
          { id: product2.id, quantity: 3 },
        ],
      });

      await request(app).post("/api/orders").send(orderInput).expect(201);

      const updatedProductsRes = await request(app)
        .get("/api/products")
        .expect(200);
      const updatedProducts = updatedProductsRes.body as ProductResponseDto[];

      const updatedProduct1 = updatedProducts.find((p) => p.id === product1.id);
      const updatedProduct2 = updatedProducts.find((p) => p.id === product2.id);

      expect(updatedProduct1?.stock).toBe(6);
      expect(updatedProduct2?.stock).toBe(5);
    });

    it("should return 404 if product does not exist", async () => {
      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: "550e8400-e29b-41d4-a716-446655440099", quantity: 1 }],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Products not found");
    });

    it("should return 404 if one of multiple products does not exist", async () => {
      const productInput = ProductFactory.buildCreateProductInput({
        name: "Existing Product",
        stock: 10,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];
      expect(products).toHaveLength(1);

      const product = products[0];
      expect(product).toBeDefined();
      if (!product) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [
          { id: product.id, quantity: 2 },
          { id: "550e8400-e29b-41d4-a716-446655440099", quantity: 1 },
        ],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain("Products not found");
    });

    it("should return 400 if insufficient stock", async () => {
      const initialStock = 2;

      const productInput = ProductFactory.buildCreateProductInput({
        name: "Low Stock Product",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];
      expect(products).toHaveLength(1);

      const product = products[0];
      expect(product).toBeDefined();
      if (!product) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: product.id, quantity: 10 }],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Insufficient stock");
    });

    it("should return 400 if one product has insufficient stock", async () => {
      const product1Input = ProductFactory.buildCreateProductInput({
        name: "High Stock Product",
        stock: 100,
      });
      const product2Input = ProductFactory.buildCreateProductInput({
        name: "Low Stock Product",
        stock: 1,
      });

      await request(app).post("/api/products").send(product1Input).expect(201);
      await request(app).post("/api/products").send(product2Input).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(2);

      const product1 = products[0];
      const product2 = products[1];

      expect(product1).toBeDefined();
      expect(product2).toBeDefined();

      if (!product1 || !product2) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [
          { id: product1.id, quantity: 2 },
          { id: product2.id, quantity: 5 },
        ],
      });

      const res = await request(app).post("/api/orders").send(orderInput);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Insufficient stock");
    });

    it("should not reduce stock if order fails", async () => {
      const initialStock = 2;

      const productInput = ProductFactory.buildCreateProductInput({
        name: "Rollback Test Product",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(1);

      const product = products[0];

      expect(product).toBeDefined();

      if (!product) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: product.id, quantity: 10 }],
      });

      await request(app).post("/api/orders").send(orderInput).expect(400);

      const updatedProductsRes = await request(app)
        .get("/api/products")
        .expect(200);

      const updatedProducts = updatedProductsRes.body as ProductResponseDto[];

      expect(updatedProducts).toHaveLength(1);

      const updatedProduct = updatedProducts[0];

      expect(updatedProduct).toBeDefined();

      if (!updatedProduct) return;

      expect(updatedProduct.stock).toBe(initialStock);
    });

    it("should handle order with exact available stock", async () => {
      const initialStock = 5;

      const productInput = ProductFactory.buildCreateProductInput({
        name: "Exact Stock Product",
        stock: initialStock,
      });

      await request(app).post("/api/products").send(productInput).expect(201);

      const productsRes = await request(app).get("/api/products").expect(200);
      const products = productsRes.body as ProductResponseDto[];

      expect(products).toHaveLength(1);

      const product = products[0];

      expect(product).toBeDefined();

      if (!product) return;

      const orderInput = OrderFactory.buildCreateOrderInput({
        customerId,
        items: [{ id: product.id, quantity: initialStock }],
      });

      await request(app).post("/api/orders").send(orderInput).expect(201);

      const updatedProductsRes = await request(app)
        .get("/api/products")
        .expect(200);

      const updatedProducts = updatedProductsRes.body as ProductResponseDto[];

      expect(updatedProducts).toHaveLength(1);

      const updatedProduct = updatedProducts[0];

      expect(updatedProduct).toBeDefined();

      if (!updatedProduct) return;

      expect(updatedProduct.stock).toBe(0);
    });

    describe("Validation", () => {
      const itemId = "550e8400-e29b-41d4-a716-446655440001";
      it("should return 400 if customerId is missing", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            items: [
              {
                id: itemId,
                quantity: 1,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if customerId is not a valid UUID", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            customerId: "not-a-uuid",
            items: [
              {
                id: itemId,
                quantity: 1,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if items are missing", async () => {
        const res = await request(app).post("/api/orders").send({
          customerId,
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if items array is empty", async () => {
        const res = await request(app).post("/api/orders").send({
          customerId,
          items: [],
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if product id is not a valid UUID", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            customerId,
            items: [
              {
                id: "not-a-uuid",
                quantity: 1,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if quantity is zero", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            customerId,
            items: [
              {
                id: itemId,
                quantity: 0,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if quantity is negative", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            customerId,
            items: [
              {
                id: itemId,
                quantity: -5,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });

      it("should return 400 if quantity is not an integer", async () => {
        const res = await request(app)
          .post("/api/orders")
          .send({
            customerId,
            items: [
              {
                id: itemId,
                quantity: 1.5,
              },
            ],
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid request data");
      });
    });
  });
});
