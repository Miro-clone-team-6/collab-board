import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { Prisma, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const migrationsDir = resolve(__dirname, "../prisma/migrations");
  const migrations = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await prisma.$transaction(
    async (tx) => {
      // Serialize seed runs, including concurrent invocations from other processes.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(724661201)`;
      const applied = await tx.$queryRaw<{ migration_name: string }[]>`
        SELECT migration_name FROM "_prisma_migrations"
        WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
      `;
      const appliedNames = new Set(applied.map((row) => row.migration_name));

      for (const migration of migrations) {
        const file = resolve(migrationsDir, migration, "seed.ts");
        if (!existsSync(file)) continue;
        if (!appliedNames.has(migration)) {
          throw new Error(`Apply migration ${migration} before running its seed`);
        }
        const { seed } = require(file) as {
          seed: (transaction: Prisma.TransactionClient) => Promise<void>;
        };
        await seed(tx);
        console.log(`Seeded ${migration}`);
      }
    },
    { timeout: 60_000, maxWait: 60_000 },
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
