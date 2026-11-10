# 🗄 PostgreSQL и Prisma ORM (`apps/api`)

В качестве основной базы данных используется **PostgreSQL 16**, а для работы со схемой, типизированных запросов и миграций — **Prisma ORM**.

---

## 1. Схема данных (`apps/api/prisma/schema.prisma`)

Файл схемы располагается в `apps/api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model HealthCheck {
  id        String   @id @default(uuid())
  status    String   @default("ok")
  note      String?
  checkedAt DateTime @default(now())

  @@map("health_checks")
}
```

### Соглашения по именованию моделей:
* **Модели Prisma:** PascalCase в единственном числе (`User`, `Board`, `StickyNote`).
* **Таблицы в базе данных:** snake_case во множественном числе через `@@map("users")`, `@@map("boards")`.
* **Первичные ключи:** UUID (`@id @default(uuid())`).

---

## 2. Команды миграций и кодогенерации

Все команды запускаются через `pnpm` из корня проекта:

```bash
# Создание новой миграции при изменении schema.prisma (интерактивный режим для dev)
pnpm db:migrate

# Генерация TypeScript клиента Prisma Client
pnpm db:generate

# Запуск скрипта начального наполнения данными (Prisma Seed)
pnpm db:seed

# Применение готовых миграций в production / CI (без генерации новых)
pnpm db:migrate:deploy
```

---

## 3. Использование `PrismaService` в NestJS

`PrismaService` объявлен как глобальный провайдер и доступен для внедрения в любой сервис:

```typescript
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
```

### 🔒 Безопасность и целостность:
1. **Никогда не возвращайте чувствительные данные:** при выборке пользователей используйте явный `select`, чтобы не отдавать захэшированные пароли.
2. **Транзакции:** для операций, изменяющих несколько таблиц (например, создание доски с начальным набором стикеров), используйте транзакции:
   ```typescript
   await this.prisma.$transaction(async (tx) => {
     // ...
   });
   ```
