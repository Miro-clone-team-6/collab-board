import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";

// Both src/config and dist/config resolve to apps/api/.env.
export const envFilePath = resolve(import.meta.dirname, "../../.env");
export const rootEnvFilePath = resolve(import.meta.dirname, "../../../../.env");

export function readEnvFile(path: string): Record<string, string> {
  try {
    return dotenv.parse(readFileSync(path));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}
