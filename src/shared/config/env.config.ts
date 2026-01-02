import dotenv from "dotenv";
import * as z from "zod";

dotenv.config({ quiet: true });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().positive().max(65535),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive(),
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(",").map((origin) => origin.trim()))
    .refine((origins) => origins.every((o) => o.startsWith("http")), {
      message: "CORS_ORIGINS must be valid URLs",
    }),
});

const parsed = EnvSchema.safeParse(process.env);

if (parsed.error) {
  console.error("Invalid environment variables", parsed.error.message);
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  corsOrigin: parsed.data.CORS_ORIGIN,
  rateLimitMax: parsed.data.RATE_LIMIT_MAX,
  rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
} as const;
