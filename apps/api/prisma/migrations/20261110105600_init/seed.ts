import type { Prisma } from "@prisma/client";

export async function seed(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`
    INSERT INTO "health_checks" ("id", "status", "note")
    VALUES ('84b0579e-875e-47e6-91ba-24a0b62bb913', 'ok',
            'CollabBoard Initial System Health Record')
    ON CONFLICT ("id") DO NOTHING
  `;
  await tx.$executeRaw`
    INSERT INTO "users" ("id", "email", "name", "updatedAt")
    VALUES ('5dd3acb6-6179-44af-a593-85a2bb105670', 'test@collab-board.local',
            'Тестовый Пользователь', CURRENT_TIMESTAMP)
    ON CONFLICT ("email") DO NOTHING
  `;
}
