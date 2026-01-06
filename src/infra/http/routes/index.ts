import { Router } from "express";

import { orderRoutes } from "@modules/order";
import { productRoutes } from "@modules/product";

const router = Router();

router.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/products", productRoutes());

router.use("/orders", orderRoutes());

export default router;
