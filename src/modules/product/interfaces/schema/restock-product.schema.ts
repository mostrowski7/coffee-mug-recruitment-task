import type { ParamsId } from "@shared/http";

import z from "zod";

export const restockProductSchema = z
  .object({
    amount: z.number().int().positive(),
  })
  .strict();

export type RestockProductBody = z.infer<typeof restockProductSchema>;

export type RestockProductInput = RestockProductBody & ParamsId;
