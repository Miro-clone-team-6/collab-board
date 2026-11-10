# 🎨 CollabBoard

> Высокопроизводительный сервис совместной работы на интерактивных досках в режиме реального времени (аналог Miro).

Проект разработан для командной работы: создание рабочих пространств, бесконечные холсты, стикеры, фигуры, соединительные стрелки, совместное real-time редактирование с отображением курсоров, комментарии и экспорт досок.

---

## 🏛 Архитектура монорепозитория

Проект построен как монорепозиторий на базе **pnpm workspaces** и **Turborepo**. Кодовая база логически разделена на исполняемые приложения (**`apps/`**) и переиспользуемые библиотеки (**`packages/`**):

### 1. Приложения (`apps/*`):
* **`apps/web` (Frontend)**: Клиентское приложение на **Next.js 15 (App Router)** и **React 19**. Архитектура построена по методологии **Feature-Sliced Design (FSD)**. Для запросов к серверу используется **TanStack Query v5**, для стилей — **Tailwind CSS**, для иконок — **Lucide Icons**.
* **`apps/api` (Backend)**: Серверное приложение на **NestJS 11 (Express)**. Предоставляет типизированный REST API с автоматической генерацией документации Swagger/OpenAPI, защитными заголовками Helmet, строгим CORS и подключением к базе данных через **Prisma ORM**.
* **`apps/landing`** *(запланировано)*: Маркетинговый лендинг.
* **`apps/ui-docs`** *(запланировано)*: Документация и витрина UI-компонентов на Storybook.

### 2. Общие пакеты (`packages/*`):
* **`@packages/dto`**: Контракты данных и Zod-схемы валидации. Собирается через `@rslib/core` сразу в два формата: **ESM** (`.js`) для Next.js и **CommonJS** (`.cjs`) для NestJS.
* **`@packages/api`**: Автосгенерированный API-клиент. Содержит готовые React-хуки `useQuery` / `useMutation` для TanStack Query и изолированный HTTP-транспорт `transport.ts`.
* **`@packages/tailwind-config`**: Единый источник правды для дизайн-системы: CSS-переменные тем (`theme.css`), токены холста и стикеров (`tokens.ts`).
* **`@packages/utils`**: Общие вспомогательные функции, включая утилиту слияния классов `cn()` (`clsx` + `tailwind-merge`).
* **`@packages/ui`**: Базовые визуальные компоненты (кнопки, модалки, инпуты).
* **`@packages/types`**: Общие интерфейсы TypeScript.

### 3. Инфраструктура (`Docker Compose`):
* **`PostgreSQL 16`**: Основная реляционная база данных (порт `5432`).
* **`Redis 7`**: Кэш и будущий Pub/Sub брокер для real-time синхронизации сокетов между инстансами (порт `6379`).

---

## 🛠 Технологический стек

| Область | Технологии |
|---|---|
| **Монорепозиторий** | Turborepo, pnpm workspaces, Biome, Husky, Commitlint |
| **Frontend (`apps/web`)** | Next.js 15 (App Router, React 19), Feature-Sliced Design (FSD), TanStack Query v5, Tailwind CSS, Next-Themes |
| **Backend (`apps/api`)** | NestJS 11 (Express), TypeScript, Prisma ORM, Swagger/OpenAPI, Helmet, Cookie-Parser |
| **База данных и кэш** | PostgreSQL 16, Redis 7 (Docker Compose) |
| **Shared Tooling** | `@rslib/core` (Dual ESM/CJS build), Zod, Orval CLI |

---

## 🚀 Быстрый старт (Onboarding Guide)

Следуйте этой пошаговой инструкции, чтобы развернуть и запустить проект локально с нуля.

### Шаг 1. Системные требования
Перед началом убедитесь, что на вашей машине установлены:
- **Node.js**: `>= 22.x LTS` (проверка: `node -v`)
- **pnpm**: `>= 9.x` (проверка: `pnpm -v`, установка: `corepack enable && corepack prepare pnpm@latest --activate`)
- **Docker Desktop**: запущен и готов к работе (проверка: `docker info`)

---

### Шаг 2. Клонирование репозитория и установка зависимостей
```bash
git clone https://github.com/Miro-clone-team-6/collab-board.git
cd collab-board
pnpm install
```

---

### Шаг 3. Настройка переменных окружения (.env)
В монорепозитории используется иерархическая структура конфигураций:

1. **Корневой `.env`** — главный файл, управляющий Docker Compose (PostgreSQL, Redis):
   ```bash
   cp .env.example .env
   ```
2. **Бэкенд `apps/api/.env`** (обязательно для Prisma CLI, миграций и сидов):
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```
   > ⚠️ **Важно:** Prisma CLI (`prisma migrate`, `prisma generate`) и скрипт сидов запускаются в директории `apps/api` и читают локальный файл `.env`. Без него команды работы с БД завершатся ошибкой.
3. **Фронтенд `apps/web/.env.local`** *(опционально)*:  
   Next.js читает переменные из `apps/web/.env.local`. По умолчанию в коде зашит фоллбек на `http://localhost:3001`, но для явного указания создайте локальный конфиг:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

> Значений по умолчанию в `.env.example` достаточно для локального запуска без каких-либо изменений.

---

### Шаг 4. Запуск контейнеров инфраструктуры (PostgreSQL & Redis)
Поднимите базу данных и кэш в фоновом режиме через Docker Compose:
```bash
pnpm infra:up
```
Проверить статус контейнеров и логи:
```bash
pnpm infra:logs
```

---

### Шаг 5. Миграции базы данных и сид начальных данных
Примените схему Prisma к PostgreSQL и заполните базу стартовыми данными:
```bash
# Применение миграций к PostgreSQL
pnpm db:migrate

# Заполнение тестовыми данными (User, HealthCheck)
pnpm db:seed
```

---

### Шаг 6. Генерация API-клиента (NestJS -> OpenAPI -> Orval)
Для генерации типизированного клиента используются команды:
```bash
# Вариант А: Полный цикл генерации одной командой (Рекомендуется)
pnpm codegen
```
*Команда `pnpm codegen` последовательно запускает:*
1. `pnpm generate:api` — выгружает спецификацию Swagger из NestJS в `apps/api/openapi/openapi.json`.
2. `pnpm generate:client` — запускает Orval, который преобразует JSON-схему в готовые React-хуки в `@packages/api`.

---

### Шаг 7. Базовая сборка проекта (Production Build)
Перед первым запуском в dev-режиме рекомендуется выполнить сборку:
```bash
pnpm build
```
*Зачем это нужно:* Команда скомпилирует общие пакеты (`@packages/dto`, `@packages/ui` и др.), создаст TypeScript-декларации (`dist/*.d.ts`) и проверит, что в кодовой базе нет скрытых ошибок компиляции.

---

### Шаг 8. Запуск приложений в режиме разработки
Запустить все приложения монорепозитория одновременно:
```bash
pnpm dev
```

Либо запускайте нужные приложения по отдельности:
```bash
# Запуск только клиентского веб-приложения (Next.js на порту 3000)
pnpm dev:web

# Запуск только серверного API (NestJS на порту 3001)
pnpm dev:api
```

---

## 🌐 Доступные локальные сервисы

После запуска перейдите по ссылкам:

| Сервис | URL | Назначение |
|---|---|---|
| **Web Frontend** | [http://localhost:3000](http://localhost:3000) | Клиентское приложение доски |
| **API Healthcheck** | [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) | Проверка статуса сервера и PostgreSQL |
| **Swagger UI** | [http://localhost:3001/docs](http://localhost:3001/docs) | Интерактивная документация REST API |
| **OpenAPI Spec** | [http://localhost:3001/docs-json](http://localhost:3001/docs-json) | JSON-спецификация OpenAPI |
| **PostgreSQL** | `localhost:5432` | Порт БД (`postgres` / `postgres`) |
| **Redis** | `localhost:6379` | Порт Redis (`redis_password`) |

---

## 📜 Справочник команд (NPM Scripts)

Все команды запускаются из корня репозитория через `pnpm`:

### Разработка и запуск
- `pnpm dev` — запуск всех приложений через Turborepo
- `pnpm dev:web` — запуск только `apps/web`
- `pnpm dev:api` — запуск только `apps/api`

### Сборка и проверка качества
- `pnpm build` — сборка всех пакетов и приложений с Turborepo кэшированием
- `pnpm build:web` — сборка только Next.js
- `pnpm build:api` — сборка только NestJS
- `pnpm typecheck` — строгая проверка типов во всех воркспейсах
- `pnpm lint` — быстрая проверка кода линтером Biome
- `pnpm lint:fix` — автоматическое исправление ошибок линтера
- `pnpm format` — автоформатирование кода через Biome
- `pnpm test` — запуск unit-тестов через Vitest / Jest

### База данных (Prisma)
- `pnpm db:migrate` — создание и применение миграций для локальной разработки
- `pnpm db:migrate:deploy` — применение готовых миграций в production / CI
- `pnpm db:generate` — генерация Prisma Client
- `pnpm db:seed` — заполнение базы тестовыми данными

### Кодогенерация API
- `pnpm codegen` — полный цикл: выгрузка схемы + генерация клиента Orval
- `pnpm generate:api` — выгрузка OpenAPI схемы из NestJS в `apps/api/openapi/openapi.json`
- `pnpm generate:client` — генерация хуков Orval в `@packages/api` по существующей схеме

### Инфраструктура (Docker)
- `pnpm infra:up` — запуск PostgreSQL и Redis в фоне
- `pnpm infra:down` — остановка и удаление контейнеров
- `pnpm infra:logs` — просмотр логов контейнеров

---

## 📚 Документация для разработчиков

Перед тем как писать код, обязательно ознакомьтесь с регламентами:

1. [**Общая архитектура монорепозитория и Decision Tree**](./docs/README.md) — правила зависимостей и «Куда положить код».
2. [**Frontend Руководство (FSD & Стили)**](./docs/frontend/README.md) — слои Feature-Sliced Design, Tailwind токены, работа с данными.
3. [**Backend Руководство (NestJS & Prisma)**](./docs/backend/README.md) — модули, сервисы, миграции БД, Swagger.
4. [**Конвейер кодогенерации API (Orval Guide)**](./docs/api-codegen.md) — как добавить эндпоинт и использовать хук на фронтенде.
5. [**Регламент коммитов и Pull Request**](./docs/pull-request.md) — Conventional Commits, проверка качества и Definition of Done.
