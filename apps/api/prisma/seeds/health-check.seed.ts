import type { Prisma } from "@prisma/client";

export async function seedHealthChecks(tx: Prisma.TransactionClient): Promise<void> {
  const id = "84b0579e-875e-47e6-91ba-24a0b62bb913";
  await tx.healthCheck.upsert({
    where: { id },
    update: {},
    create: {
      id,
      status: "ok",
      note: "CollabBoard Initial System Health Record",
    },
  });
}
