# Backend

> Статус: ✅ Описывает текущий каркас `apps/api`.

NestJS 12, PostgreSQL 16 и Prisma 6.4. Общая картина проекта —
[architecture.md](../architecture.md), запуск окружения — [README](../../README.md).

В `src/modules/` сейчас реализован только `health`:
`GET /api/v1/health` проверяет готовность API и его зависимостей: сейчас PostgreSQL,
при подключении других сервисов их проверки добавляются сюда же.
Если все зависимости доступны — HTTP 200 и `status: "ok"`; при отказе — HTTP 503
и `status: "error"`. Поле `database` содержит результат проверки PostgreSQL.

`src/modules/users/` — подключённая заглушка `UsersModule`, без эндпоинтов и логики.

Код приложения:

- `src/main.ts` — запуск HTTP-сервера.
- `src/configure-app.ts` — префикс `/api/v1`, CORS, Helmet, cookies и Swagger.
- `src/app.module.ts` — подключение конфигурации, Prisma и функциональных модулей.
- `src/modules/health/` — проверка состояния приложения: модуль, контроллер,
  сервис и DTO лежат рядом, без вложенных папок.
- `src/prisma/` — подключение Prisma Client через DI NestJS.

Swagger доступен на `/docs` вне production. Авторизация и runtime-валидация входных
DTO пока не реализованы. Наличие зависимостей и переменных
окружения не означает, что эти механизмы подключены.

Код группируем по бизнес-модулям в `src/modules/`. Внутри модуля выделяем
`presentation` (HTTP и DTO), `application` (сценарии и порты), `domain`
(сущности и бизнес-правила), `infrastructure` (БД и внешние интеграции).
Создаём только необходимые слои. У технического `health` достаточно контроллера,
DTO и сервиса: use case, порт и адаптер проверки БД не нужны.

В бизнес-модулях контроллер вызывает use case; use case зависит от контракта в `application/ports`,
а не от Prisma. Реализации подключаем в `<name>.module.ts` через Nest DI.
Контракты репозиториев бизнес-модулей также размещаем в `application/ports`,
реализации — в `infrastructure/persistence`; Prisma-типы наружу не передаём.
Проверка подключения в `health` напрямую использует Prisma, репозиторий ей не нужен.
Prisma-модель описывает хранение, а не заменяет доменную модель.

## Конфигурация и подключение

`ConfigModule` загружает `apps/api/.env` по пути относительно файла конфигурации,
независимо от текущего каталога. Корневой `.env` API не читает.
Приоритет: переменные окружения процесса → `apps/api/.env` → дефолты.
Локальные `.env` не коммитим; доступные настройки — в `apps/api/.env.example`.

В `src/config/` находятся конфигурации `database` и `http`, объявленные через
`registerAs`. Zod проверяет значения при запуске; `ConfigType` выводит типы.
Сервис получает нужную конфигурацию через Nest DI:

```ts
constructor(
  @Inject(databaseConfig.KEY) database: ConfigType<typeof databaseConfig>,
) {
  // database.url
}
```

`DATABASE_URL` обязателен, без дефолта. `PORT` — целое число от 1 до 65535,
по умолчанию 3001; `NODE_ENV` — development (дефолт), test или production.
`ALLOWED_ORIGINS` задаёт полный список разрешённых HTTP(S) origins через запятую,
без путей и завершающего `/`. По умолчанию в dev/test разрешены
`http://localhost:3000` и `http://127.0.0.1:3000`, в production — ни одного.
Пустая строка явно задаёт пустой список.
`API_PORT`, `FRONTEND_URL` и `NEXT_PUBLIC_APP_URL` API больше не использует.

Prisma получает URL из конфигурации явно. API начинает слушать HTTP только после
успешного подключения к БД; ошибка подключения останавливает запуск.
При завершении процесса Prisma закрывает соединения через shutdown hooks Nest.
Сиды используют тот же файл окружения и ту же проверку `DATABASE_URL`;
Prisma CLI читает `apps/api/.env` при запуске через `pnpm db:*`.
Если меняете параметры PostgreSQL в корневом `.env` для Docker, согласуйте с ними
`DATABASE_URL` в `apps/api/.env`.

## HTTP-контракты

Схемы запросов и ответов описываем в `packages/contracts/src/<feature>/` через Zod.
Типы выводим через `z.infer`; Prisma-модели и доменные сущности не экспортируем.
Nest DTO-класс наследует `createZodDto` общей схемы без повторения полей.

У `health` ответ проверяется `ZodSerializerInterceptor`, Swagger использует ту же схему.
Фронтенд получает `/api/v1/health` через Next-прокси и проверяет JSON общей схемой.
Входящих DTO у этого эндпоинта нет; валидация запросов пока не подключена.
Подробности решения — [ADR 0002](../decisions/0002-shared-contracts.md).

## База данных

PostgreSQL запускается через Docker Compose. Подключение задаёт `DATABASE_URL`;
локальная настройка описана в [README](../../README.md).

### Модели

```text
apps/api/prisma/
├── schema/
│   ├── schema.prisma      # datasource и generator
│   └── models/
│       ├── user.prisma
│       └── health-check.prisma
├── migrations/
│   ├── migration_lock.toml
│   └── <timestamp>_<name>/migration.sql
└── seeds/
    ├── index.ts           # явный порядок запуска сидов
    ├── user.seed.ts
    └── health-check.seed.ts
```

Одна логическая модель или группа моделей агрегата — один файл в `schema/models/`.
Имена файлов — `kebab-case.prisma`, моделей — PascalCase в единственном числе.
Таблицы — snake_case во множественном числе через `@@map`, например `User` → `users`.
Первичные ключи — `String @id @default(uuid())`.
Это модели хранения; отдельные доменные сущности при необходимости живут в коде приложения.

`schema.prisma` содержит только настройки подключения и генератора.
В Prisma 6.4 разбиение схемы включено флагом `prismaSchemaFolder`;
каталог `prisma/schema` задан в `apps/api/package.json`.
В этой версии CLI ищет миграции рядом с каталогом схемы: `prisma/migrations`.

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
