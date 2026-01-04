import { Router } from "express";

import { paramsIdSchema } from "@shared/http";
import { validateBody, validateParams } from "@shared/http";

import { productController } from "./product.controller.js";
import { createProductSchema } from "./schema/create-product.schema.js";
import { restockProductSchema } from "./schema/restock-product.schema.js";

export function productRoutes() {
  const router = Router();
  const controller = productController();

  router.post("/", validateBody(createProductSchema), controller.createProduct);

  router.get("/", controller.getAllProducts);

  router.post(
    "/:id/restock",
    validateParams(paramsIdSchema),
    validateBody(restockProductSchema),
    controller.restockProduct,
  );

  return router;
}
