import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "../../.env" });

const prisma = new PrismaClient();

async function main() {
  await prisma.healthCheck.create({
    data: {
      status: "ok",
      note: "CollabBoard Initial System Health Record",
    },
  });

  await prisma.user.upsert({
    where: { email: "test@collab-board.local" },
    update: {},
    create: {
      email: "test@collab-board.local",
      name: "Тестовый Пользователь",
    },
  });

  console.log("🌱 Базовые данные успешно добавлены в PostgreSQL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
