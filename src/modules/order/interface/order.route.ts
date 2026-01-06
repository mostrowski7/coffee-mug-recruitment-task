import { Router } from "express";

import { validateBody } from "@shared/http";

import { orderController } from "./order.controller.js";
import { createOrderSchema } from "./schema/create-order.schema.js";

export function orderRoutes() {
  const router = Router();
  const controller = orderController();

  router.post("/", validateBody(createOrderSchema), controller.createOrder);

  return router;
}
