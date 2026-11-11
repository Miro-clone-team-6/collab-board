# CollabBoard

Онлайн-доска для совместной работы в реальном времени: бесконечный холст со стикерами, фигурами и
стрелками, на котором команда работает одновременно и видит курсоры друг друга.

Проект в начале разработки: собран каркас монорепозитория (Next.js + NestJS + PostgreSQL). Продуктовых фич пока нет. Что строим — [docs/product.md](./docs/product.md).

Стек: pnpm + Turborepo, Next.js 16 / React 19, NestJS 11, Prisma, PostgreSQL 16, Redis 7, TanStack Query, Biome.

## Быстрый старт

Нужны Node.js ≥ 22, pnpm 9 (`corepack enable`), Docker.

```bash
pnpm install

# переменные окружения (значений по умолчанию достаточно)
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

pnpm infra:up      # PostgreSQL + Redis в Docker
pnpm db:migrate    # миграции
pnpm db:seed       # тестовые данные
pnpm build         # собрать dto, utils, types в dist — без этого web и api не найдут их
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
pnpm test
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
