import type { Request, Response } from "express";

import { container } from "tsyringe";

import { CreateProductCommand } from "../application/commands/create-product.command.js";
import { GetAllProductsQuery } from "../application/queries/get-all-products.query.js";

export function productController() {
  return {
    async createProduct(req: Request, res: Response) {
      const command = container.resolve(CreateProductCommand);

      await command.execute(req.body);

      res.sendStatus(201);
    },

    async getAllProducts(_: Request, res: Response) {
      const query = container.resolve(GetAllProductsQuery);

      const products = await query.execute();

      res.json(products);
    },
  };
}
