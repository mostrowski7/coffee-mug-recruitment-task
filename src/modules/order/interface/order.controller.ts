import type { Request, Response } from "express";

import { container } from "tsyringe";

import { CreateOrderCommand } from "../application/commands/create-order.command.js";

export function orderController() {
  return {
    async createOrder(req: Request, res: Response) {
      const command = container.resolve(CreateOrderCommand);

      await command.execute(req.body);

      res.sendStatus(201);
    },
  };
}
