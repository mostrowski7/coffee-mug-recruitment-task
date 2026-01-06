import z from "zod";

export const createProductSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    description: z.string().trim().min(1).max(50),
    price: z.number().positive(),
    stock: z.number().nonnegative().int(),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
