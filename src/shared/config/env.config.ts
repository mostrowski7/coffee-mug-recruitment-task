import dotenv from "dotenv";
import * as z from "zod";

dotenv.config({ quiet: true });

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform((val) => parseInt(val, 10)),
});

const parsed = EnvSchema.safeParse(process.env);

if (parsed.error) {
  console.error("Invalid environment variables", parsed.error.message);
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
} as const;
