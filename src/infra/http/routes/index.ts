import { Router } from "express";

import { orderRoutes } from "@modules/order";
import { productRoutes } from "@modules/product";

const router = Router();

router.use("/products", productRoutes());

router.use("/orders", orderRoutes());

export default router;
