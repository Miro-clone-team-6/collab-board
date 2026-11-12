import { registerAs } from "@nestjs/config";
import { z } from "zod";

const origin = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["http:", "https:"].includes(url.protocol) && url.origin === value;
});

const httpEnvironment = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  ALLOWED_ORIGINS: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    )
    .pipe(z.array(origin))
    .optional(),
});

export function readHttpConfig(environment: NodeJS.ProcessEnv) {
  const result = httpEnvironment.safeParse(environment);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path[0]))];
    throw new Error(`Invalid HTTP configuration: ${fields.join(", ")}`);
  }

  const { NODE_ENV, PORT, ALLOWED_ORIGINS } = result.data;
  return {
    port: PORT,
    isProduction: NODE_ENV === "production",
    allowedOrigins:
      ALLOWED_ORIGINS ??
      (NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://127.0.0.1:3000"]),
  };
}

export const httpConfig = registerAs("http", () => readHttpConfig(process.env));
