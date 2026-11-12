import { registerAs } from "@nestjs/config";
import { z } from "zod";

const databaseEnvironment = z.object({
  DATABASE_URL: z
    .url()
    .regex(/^postgres(?:ql)?:\/\//)
    .refine((value) => URL.canParse(value) && new URL(value).hostname.length > 0),
});

export function readDatabaseConfig(environment: NodeJS.ProcessEnv) {
  const result = databaseEnvironment.safeParse(environment);
  if (!result.success) {
    throw new Error("Invalid DATABASE_URL: expected a PostgreSQL connection URL");
  }

  return { url: result.data.DATABASE_URL };
}

export const databaseConfig = registerAs("database", () => readDatabaseConfig(process.env));
