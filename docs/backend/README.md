# Backend

> Статус: ✅ Описывает текущий каркас `apps/api`.

NestJS 11, PostgreSQL 16 и Prisma 6.4. Общая картина проекта —
[architecture.md](../architecture.md), запуск окружения — [README](../../README.md).

В `src/modules/` сейчас реализован только `health`:
`GET /api/v1/health` возвращает состояние процесса и результат проверки подключения к БД.

Код приложения:

- `src/main.ts` — запуск HTTP-сервера.
- `src/configure-app.ts` — префикс `/api/v1`, CORS, Helmet, cookies и Swagger.
- `src/app.module.ts` — подключение конфигурации, Prisma и функциональных модулей.
- `src/modules/health/` — контроллер, сервис и DTO ответа.
- `src/prisma/` — подключение Prisma Client через DI NestJS.

Swagger доступен на `/docs` вне production. Авторизация, runtime-валидация входных
DTO и интеграция Redis пока не реализованы. Наличие зависимостей и переменных
окружения не означает, что эти механизмы подключены.

DDD-структура бизнес-модулей пока не закреплена. При появлении бизнес-логики
границы домена и хранения определяем отдельно; Prisma-модель описывает хранение,
а не заменяет доменную модель.

## База данных

PostgreSQL запускается через Docker Compose. Подключение задаёт `DATABASE_URL`;
локальная настройка описана в [README](../../README.md).

### Модели

```text
apps/api/prisma/
├── schema.prisma          # datasource и generator
├── models/
│   ├── user.prisma
│   └── health-check.prisma
├── migrations/
│   ├── migration_lock.toml
│   └── <timestamp>_<name>/migration.sql
└── seeds/
    ├── index.ts           # явный порядок запуска сидов
    ├── user.seed.ts
    └── health-check.seed.ts
```

Одна логическая модель или группа моделей агрегата — один файл в `models/`.
Имена файлов — `kebab-case.prisma`, моделей — PascalCase в единственном числе.
Таблицы — snake_case во множественном числе через `@@map`, например `User` → `users`.
Первичные ключи — `String @id @default(uuid())`.
Это модели хранения; отдельные доменные сущности при необходимости живут в коде приложения.

`schema.prisma` содержит только настройки подключения и генератора.
В Prisma 6.4 разбиение схемы включено флагом `prismaSchemaFolder`;
каталог `prisma` задан в `apps/api/package.json`.

### Миграции

Команды выполняются из корня репозитория:

```bash
pnpm --filter api exec prisma migrate dev --name <name>
pnpm db:generate
```

Первая команда создаёт и применяет миграцию к dev-базе. Prisma формирует имя
`<YYYYMMDDHHmmss>_<name>` с timestamp в UTC. SQL и изменения моделей коммитим вместе.
`db:generate` обновляет Prisma Client, не изменяя базу.

Если нужно дополнить SQL вручную, создайте миграцию с `--create-only`,
отредактируйте её и примените через `pnpm db:migrate`.
Обязательные справочники и преобразования данных включаем в `migration.sql`.
Prisma хранит историю применения в `_prisma_migrations`;
применённые миграции не редактируем и не переименовываем.

В CI и production готовые миграции применяет `pnpm db:migrate:deploy`.

### Тестовые данные

`pnpm db:seed` запускает `prisma db seed` → `prisma/seeds/index.ts`.
Сиды отделены от миграций: файл `<model>.seed.ts` на модель или логическую группу.
Новый сид явно импортируем и вызываем в `index.ts` после его зависимостей.
Нумерация файлов не нужна.

Сиды работают через переданный `Prisma.TransactionClient` в общей транзакции.
Для повторного запуска используем `upsert` по уникальному ключу или стабильному ID;
`update: {}` сохраняет существующие данные. При изменении моделей обновляем сиды.
Сейчас они создают тестового пользователя и запись health-check.

`migrate deploy` сиды не вызывает; в production тестовое наполнение не запускаем.
Prisma 6 может автоматически запустить сиды после сброса базы в dev.
