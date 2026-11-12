import dotenv from "dotenv";
import { readDatabaseConfig } from "../../src/config/database.config.js";
import { envFilePath } from "../../src/config/env-file.js";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import { createPrismaAdapter } from "../../src/prisma/prisma.adapter.js";
import { seedHealthChecks } from "./health-check.seed.js";
import { seedUsers } from "./user.seed.js";

dotenv.config({ path: envFilePath, quiet: true });

const database = readDatabaseConfig(process.env);
const prisma = new PrismaClient({ adapter: createPrismaAdapter(database.url) });

async function main(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await seedUsers(tx);
    await seedHealthChecks(tx);
  });
  console.log("Development seed data is ready");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
