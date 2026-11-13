# CollabBoard

Онлайн-доска для совместной работы в реальном времени: бесконечный холст со стикерами, фигурами и
стрелками, на котором команда работает одновременно и видит курсоры друг друга.

Проект в начале разработки: собран каркас монорепозитория (Next.js + NestJS + PostgreSQL). Продуктовых фич пока нет. Что строим — [docs/product.md](./docs/product.md).

Стек: pnpm + Turborepo, Next.js 16 / React 19, NestJS 12, Prisma, PostgreSQL 16, TanStack Query, Biome.

## Быстрый старт

Нужны Node.js 26.x (версия задана в `.nvmrc`), pnpm 12.18.0, Docker.

Установить и выбрать Node через nvm, затем установить pnpm (Corepack не входит в Node.js 26):

```bash
nvm install
nvm use
npm install --global pnpm@12.18.0
```

При работе с проектом переключать Node командой `nvm use`. Установка зависимостей требует Node.js 26.x
(`engines.node` и `engineStrict: true` в `pnpm-workspace.yaml`).

```bash
pnpm install

# переменные окружения (значений по умолчанию достаточно)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

pnpm infra:up      # PostgreSQL в Docker
pnpm db:migrate    # миграции
pnpm db:seed       # тестовые данные
pnpm dev           # web :3000, api :3001
```

| Что | Где |
|---|---|
| Web | http://localhost:3000 |
| API health | http://localhost:3001/api/v1/health |
| Swagger UI | http://localhost:3001/docs |

## Основные команды

```bash
pnpm dev:web / dev:api   # одно приложение
pnpm typecheck           # типы во всех workspaces
pnpm lint                # Biome + Steiger (FSD)
pnpm lint:fix            # автоисправление Biome
pnpm lint:fsd            # только Steiger
pnpm infra:down
```

Полный список — `scripts` в [package.json](./package.json).

## Документация

| | |
|---|---|
| [docs/product.md](./docs/product.md) | Что строим: пользователи, домен, MVP |
| [docs/architecture.md](./docs/architecture.md) | Устройство репозитория, границы, куда класть код |
| [docs/decisions/](./docs/decisions/README.md) | Архитектурные решения и их статус |
| [docs/frontend/](./docs/frontend/README.md), [docs/backend/](./docs/backend/README.md) | Детали по частям (на пересмотре) |
| [docs/pull-request.md](./docs/pull-request.md) | Ветки, коммиты, PR |
| [docs/review.md](./docs/review.md) | Правила ревью |
| [AGENTS.md](./AGENTS.md) | Инструкции для AI-агентов |

Каждый документ начинается со статуса: ✅ актуален и сверен с кодом, 🚧 черновик, 📐 решение без кода.
