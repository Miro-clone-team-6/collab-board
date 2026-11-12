import type { Prisma } from "@prisma/client";

export async function seedUsers(tx: Prisma.TransactionClient): Promise<void> {
  await tx.user.upsert({
    where: { email: "test@collab-board.local" },
    update: {},
    create: {
      id: "5dd3acb6-6179-44af-a593-85a2bb105670",
      email: "test@collab-board.local",
      name: "Тестовый Пользователь",
    },
  });
}
