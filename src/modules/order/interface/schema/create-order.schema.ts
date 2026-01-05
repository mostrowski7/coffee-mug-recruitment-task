import z from "zod";

export const createOrderSchema = z
  .object({
    customerId: z.uuid(),
    items: z
      .array(
        z.object({
          id: z.uuid(),
          quantity: z.number().int().positive(),
        }),
      )
      .min(1, "Order must contain at least one item"),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
