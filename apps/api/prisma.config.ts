import { resolve } from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: resolve(import.meta.dirname, ".env"), quiet: true });

const url = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seeds/index.ts",
  },
  ...(url ? { datasource: { url } } : {}),
});
