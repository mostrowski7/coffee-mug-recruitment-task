import { Router } from "express";

import { validateBody } from "@shared/http";

import { createProductSchema } from "./create-product.schema.js";
import { productController } from "./product.controller.js";

export function productRoutes() {
  const router = Router();
  const controller = productController();

  router.post("/", validateBody(createProductSchema), controller.createProduct);

  return router;
}
