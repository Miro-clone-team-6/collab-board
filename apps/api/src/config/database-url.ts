import { envFilePath, readEnvFile, rootEnvFilePath } from "./env-file.js";

export function resolveDatabaseUrl(environment: NodeJS.ProcessEnv = process.env): string {
  const explicitUrl = environment.DATABASE_URL ?? readEnvFile(envFilePath).DATABASE_URL;
  if (explicitUrl !== undefined) return explicitUrl;

  const rootEnv = readEnvFile(rootEnvFilePath);
  const setting = (key: string, fallback: string) => (environment[key] ?? rootEnv[key]) || fallback;

  const user = encodeURIComponent(setting("POSTGRES_USER", "postgres"));
  const password = encodeURIComponent(setting("POSTGRES_PASSWORD", "postgres"));
  const database = encodeURIComponent(setting("POSTGRES_DB", "collab_board"));
  const port = setting("POSTGRES_PORT", "5432");

  return `postgresql://${user}:${password}@127.0.0.1:${port}/${database}?schema=public`;
}
