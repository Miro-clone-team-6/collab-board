# ⚙️ Документация Backend (`apps/api`)

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../architecture.md).

Добро пожаловать в техническую документацию серверной части CollabBoard!  
Здесь собраны правила, стандарты, архитектурные решения и руководства по разработке серверной части.

---

## ⚡ Шпаргалка: Куда положить код? (Decision Tree)

```text
Какой тип бэкенд-кода вы создаете?
├── REST API эндпоинт, бизнес-логика или CRUD сущности?
│   ├── Модуль домена (Boards, Users, Workspaces, Elements) ──► apps/api/src/modules/<module-name>/
│   │   ├── HTTP маршрутизация и Swagger декораторы ──► <module-name>.controller.ts
│   │   ├── Бизнес-логика и транзакции ──► <module-name>.service.ts
│   │   └── Определение модуля ──► <module-name>.module.ts
│   │
│   └── Валидация входных данных (Zod DTO)?
│       └── Добавить схему и DTO в переиспользуемый пакет ──► packages/dto/src/
│
├── Работа с базой данных (PostgreSQL)?
│   ├── Модели данных и связи ──► apps/api/prisma/schema.prisma
│   └── Сервис доступа к БД ──► apps/api/src/prisma/prisma.service.ts
│
├── Работа с кэшем, токенами или WebSockets Pub/Sub (Redis)?
│   └── docs/backend/data/redis.md
│
└── Конфигурация приложения, CORS, Helmet, Swagger?
    └── apps/api/src/configure-app.ts
```

---

## 📁 Структура разделов документации

### 1. Архитектура и сервисы
* [**Архитектура модулей NestJS**](./architecture/nestjs-modules.md) — структура слоев (Controller, Service, Module), внедрение зависимостей, Zod-валидация и глобальная конфигурация.

### 2. Базы данных и хранилище
* [**PostgreSQL и Prisma ORM**](./data/database-prisma.md) — схема данных, соглашения по именованию таблиц, жизненный цикл миграций (`db:migrate`, `db:seed`) и использование `PrismaService`.
* [**Redis: Сессии, Rate-Limiting и Pub/Sub**](./data/redis.md) — сценарии использования in-memory хранилища и шина событий для real-time синхронизации сокетов.

### 3. Стандарты разработки и качество
* [**Стандарты разработки и обработка ошибок**](./development/guidelines.md) — правила написания контроллеров, стандартные HTTP-исключения, безопасность и хеширование.

### 4. Безопасность и авторизация
* [**Безопасность и JWT-Аутентификация**](./security/auth-jwt.md) — токены в куках, сессии, хеширование паролей.
