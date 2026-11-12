import { resolve } from "node:path";

// Both src/config and dist/config resolve to apps/api/.env.
export const envFilePath = resolve(import.meta.dirname, "../../.env");
