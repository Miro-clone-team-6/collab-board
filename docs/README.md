# 🧭 Архитектурный гид и монорепозиторий CollabBoard

Добро пожаловать в техническую документацию проекта! Этот документ определяет **правила монорепозитория**, границы ответственности пакетов и помогает ответить на вопрос: **«Куда и как писать код?»**.

---

## 🗺 1. Карта монорепозитория (Monorepo Map)

Монорепозиторий разделен на две основные зоны:
1. **`apps/*` (Приложения)** — исполняемые сервисы, которые запускаются в продакшене.
2. **`packages/*` (Shared-пакеты)** — переиспользуемые библиотеки, утилиты и контракты.

### Приложения:
- **`apps/web`**: Фронтенд на Next.js 15 (App Router, React 19) по методологии FSD.
- **`apps/api`**: Бэкенд на NestJS 11 + Prisma ORM + Swagger REST API.
- **`apps/landing`**: Маркетинговый лендинг проекта.
- **`apps/ui-docs`**: Документация дизайн-системы и Storybook.

### Пакеты:
- **`@packages/dto`**: Контракты данных и Zod-схемы валидации (Dual ESM/CJS сборка через Rslib).
- **`@packages/api`**: Автогенерированный API-клиент + хуки TanStack Query v5.
- **`@packages/tailwind-config`**: Дизайн-токены, цвета стикеров/холста и CSS-тема.
- **`@packages/ui`**: Общий UI Kit компонентов (shadcn / Radix).
- **`@packages/utils`**: Общие хелперы (`cn`, форматирование дат, строк).
- **`@packages/types`**: Общие TypeScript интерфейсы и енумы.

---

## ⚖️ 2. Главный закон монорепозитория (Monorepo Constitution)

Чтобы архитектура не превратилась в «спагетти» из циклических зависимостей, команда обязана соблюдать три правила:

1. 🚫 **Пакеты `packages/*` НИКОГДА не импортируют код из `apps/*`.**  
   Shared-пакет не может знать о существовании конкретного приложения. Зависимость всегда направлена от `apps` к `packages`.
2. 📦 **Изоляция и сборка (Dual ESM/CJS):**  
   Пакеты, используемые одновременно во фронтенде и бэкенде (например, `@packages/dto`), собираются через `@rslib/core` в оба формата:
   - `dist/index.js` (ESM) — для Next.js App Router;
   - `dist/index.cjs` (CommonJS) — для NestJS.
3. 🔄 **Контракты данных первичны (Single Source of Truth):**  
   Если одна и та же структура данных используется и клиентом, и сервером (например, тело создания доски `CreateBoardDto`), она **всегда объявляется в `@packages/dto`** через Zod, а не дублируется руками в `apps/web` и `apps/api`.

---

## 🌳 3. Дерево решений: «Куда положить код?» (Decision Tree)

Используйте эту схему перед созданием любого нового файла:

```text
Какой тип кода вы создаете?
│
├── 🎨 Базовый UI элемент (Кнопка, Модалка, Инпут, Дропдаун, Бейдж)?
│   ├── Нужен в разных приложениях / дизайн-системе? ──► packages/ui
│   └── Специфичен строго для одного экрана в web? ──► apps/web/src/shared/ui
│
├── 🎨 Цвета, радиусы, цвета стикеров, токены холста?
│   └── packages/tailwind-config
│
├── 📋 Валидация входных данных, Zod-схемы, DTO запросов/ответов?
│   └── packages/dto
│
├── 🔧 Чистая функция без бизнес-логики (cn, форматирование даты, slugify)?
│   └── packages/utils
│
├── 🌐 Логика фронтенда (экран, тулбар, перемещение стикера, холст)?
│   └── apps/web/src/ (по слоям FSD: app, widgets, features, entities, shared)
│       └── см. docs/frontend/README.md
│
├── ⚙️ Логика бэкенда (контроллер, сервис, таблицы БД, миграции)?
│   └── apps/api/src/modules/<имя_модуля>/
│       └── см. docs/backend/README.md
│
└── 📡 Сетевой запрос к API бэкенда?
    └── НЕ ПИСАТЬ РУКАМИ! Сгенерировать хук через pnpm codegen (см. docs/api-codegen.md)
```

---

## 📑 4. Навигация по специализированным разделам документации

### Frontend (`apps/web`):
- [**Frontend Обзор и FSD**](./frontend/README.md) — общие принципы слоев и архитектуры фронтенда.
- [**FSD Архитектура**](./frontend/architecture/fsd.md) — детальные правила слоев FSD и слайсов.
- [**Next.js App Router**](./frontend/architecture/nextjs.md) — маршрутизация, лейауты, провайдеры и rewrites.
- [**API Contracts & Orval**](./frontend/data/api-contracts.md) — кодогенерация и автогенерация клиента.
- [**TanStack Query**](./frontend/data/tanstack-query.md) — серверное состояние, кэширование и ключи запросов.
- [**State Management**](./frontend/data/state-management.md) — разделение серверного состояния (Query) и холста (Zustand).
- [**Стилизация и Tailwind**](./frontend/ui/styling.md) — токены темы, стикеры и утилита `cn()`.
- [**UI Kit**](./frontend/ui/ui-kit.md) — правила разработки компонентов дизайн-системы.
- [**Сборка и команды**](./frontend/development/build.md) — команды сборки, фильтрации и запуска воркспейсов.

### Backend (`apps/api`):
- [**Backend Обзор**](./backend/README.md) — архитектура NestJS и базовая конфигурация.
- [**Модульная архитектура NestJS**](./backend/architecture/nestjs-modules.md) — контроллеры, сервисы и DI.
- [**База данных и Prisma ORM**](./backend/data/database-prisma.md) — PostgreSQL, схема данных, миграции и сиды.
- [**Redis & Caching**](./backend/data/redis.md) — кэш и Pub/Sub брокер для сокетов.
- [**Стандарты разработки и ошибки**](./backend/development/guidelines.md) — NestJS стандарты и типизированные исключения.
- [**Безопасность и JWT**](./backend/security/auth-jwt.md) — JWT токены, HttpOnly cookies и Argon2id.

### Общие процессы:
- [**Конвейер API Кодогенерации**](./api-codegen.md) — пошаговый алгоритм добавления эндпоинта за 3 шага.
- [**Регламент коммитов и PR**](./pull-request.md) — правила Conventional Commits, скоупы и Definition of Done.
