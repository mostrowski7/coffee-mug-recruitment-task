import type { ParamsId } from "@shared/http";

import z from "zod";

export const sellProductSchema = z.object({
  amount: z.number().int().positive(),
});

export type SellProductBody = z.infer<typeof sellProductSchema>;

export type SellProductInput = SellProductBody & ParamsId;
