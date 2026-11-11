import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { readDatabaseConfig } from "../../src/config/database.config";
import { envFilePath } from "../../src/config/env-file";
import { seedHealthChecks } from "./health-check.seed";
import { seedUsers } from "./user.seed";

dotenv.config({ path: envFilePath, quiet: true });

const database = readDatabaseConfig(process.env);
const prisma = new PrismaClient({ datasourceUrl: database.url });

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
