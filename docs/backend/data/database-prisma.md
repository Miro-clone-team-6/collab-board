# 🗄 PostgreSQL и Prisma ORM (`apps/api`)

В качестве основной базы данных используется **PostgreSQL 16**, а для работы со схемой, типизированных запросов и миграций — **Prisma ORM**.

---

## 1. Схема данных (`apps/api/prisma/`)

```text
prisma/
├── schema.prisma          # только datasource и generator
├── models/
│   ├── user.prisma
│   └── health-check.prisma
└── migrations/
    └── 20261110105600_init/
        ├── migration.sql
        └── seed.ts
```

Одна логическая модель или группа моделей агрегата — один файл в `models/`.
Это модели хранения, а не обязательно доменные сущности.
В Prisma 6.4 включён `prismaSchemaFolder`, каталог схемы задан через
`prisma.schema` в `apps/api/package.json`.

### Соглашения по именованию моделей:
* **Модели Prisma:** PascalCase в единственном числе (`User`, `Board`, `StickyNote`).
* **Таблицы в базе данных:** snake_case во множественном числе через `@@map("users")`, `@@map("boards")`.
* **Первичные ключи:** UUID (`@id @default(uuid())`).

---

## 2. Команды миграций и кодогенерации

Все команды запускаются через `pnpm` из корня проекта:

```bash
# Создание новой миграции при изменении файлов схемы (интерактивный режим для dev)
pnpm db:migrate

# Генерация TypeScript клиента Prisma Client
pnpm db:generate

# Запуск скрипта начального наполнения данными (Prisma Seed)
pnpm db:seed

# Применение готовых миграций в production / CI (без генерации новых)
pnpm db:migrate:deploy
```

---

### Сиды миграций

Для миграции с начальными данными создаётся `seed.ts` рядом с `migration.sql`.
Экспорт: `seed(tx: Prisma.TransactionClient): Promise<void>`.
Если данных нет, файл не нужен.

`pnpm db:seed` запускает `scripts/seed.ts`: проверяет, что миграции применены,
выполняет сиды по порядку имён в общей транзакции с блокировкой от параллельного
запуска. Ошибка откатывает все изменения. Истории сидов нет: каждый запуск
повторяет все сиды, поэтому они обязаны быть идемпотентными и не перезаписывать
изменённые пользователем данные. Используйте стабильные ID и `ON CONFLICT`.

Параметризованный SQL через `tx` не зависит от будущих моделей Prisma Client.
При переименовании/удалении таблиц и колонок проверяйте совместимость всей цепочки
сидов с актуальной БД. Это повторяемое наполнение, а не одноразовые data migrations:
обязательные преобразования данных помещайте в `migration.sql`.

`migrate deploy` не запускает сиды; `pnpm db:seed` вызывается отдельно.
Prisma может вызвать настроенный seed после сброса базы в dev.
Начальный сид содержит тестового пользователя и предназначен для локальной разработки.

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
