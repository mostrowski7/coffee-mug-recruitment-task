import type { RestockProductBody } from "./schema/restock-product.schema.js";
import type { SellProductBody } from "./schema/sell-product.schema.js";
import type { ParamsId } from "@shared/http";
import type { Request, Response } from "express";

import { container } from "tsyringe";

import { CreateProductCommand } from "../application/commands/create-product.command.js";
import { RestockProductCommand } from "../application/commands/restock-product.command.js";
import { SellProductCommand } from "../application/commands/sell-product.command.js";
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

    async restockProduct(req: Request, res: Response) {
      const command = container.resolve(RestockProductCommand);

      const params = res.locals.params as ParamsId;
      const body = req.body as RestockProductBody;

      await command.execute({
        id: params.id,
        amount: body.amount,
      });

      res.sendStatus(204);
    },

    async sellProduct(req: Request, res: Response) {
      const command = container.resolve(SellProductCommand);

      const params = res.locals.params as ParamsId;
      const body = req.body as SellProductBody;

      await command.execute({
        id: params.id,
        amount: body.amount,
      });

      res.sendStatus(204);
    },
  };
}
