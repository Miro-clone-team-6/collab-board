import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { seedHealthChecks } from "./health-check.seed";
import { seedUsers } from "./user.seed";

dotenv.config();
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();

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
