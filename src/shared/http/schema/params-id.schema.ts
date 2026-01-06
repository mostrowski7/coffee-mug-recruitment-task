import z from "zod";

export const paramsIdSchema = z
  .object({
    id: z.uuid(),
  })
  .strict();

export type ParamsId = z.infer<typeof paramsIdSchema>;
