import { Router } from "express";

import { productRoutes } from "@modules/product";

const router = Router();

router.use("/products", productRoutes());

export default router;
