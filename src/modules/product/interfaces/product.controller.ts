import type { Request, Response } from "express";

import { container } from "tsyringe";

import { CreateProductCommand } from "../application/commands/create-product.command.js";

export function productController() {
  return {
    async createProduct(req: Request, res: Response) {
      const createProductCommand = container.resolve(CreateProductCommand);

      await createProductCommand.execute(req.body);

      res.sendStatus(201);
    },
  };
}
