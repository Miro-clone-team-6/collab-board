import dotenv from "dotenv";
import { defineConfig } from "prisma/config";
import { resolveDatabaseUrl } from "./src/config/database-url.js";
import { envFilePath } from "./src/config/env-file.js";

dotenv.config({ path: envFilePath, quiet: true });

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seeds/index.ts",
  },
  datasource: { url: resolveDatabaseUrl() },
});
