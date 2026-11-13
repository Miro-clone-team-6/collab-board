# CollabBoard

Монорепозиторий (pnpm 12.18.0 + Turborepo, Node 26.x) для доски совместной работы.

Версия Node задана в `.nvmrc`: перед работой выполнить `nvm install` (если версия ещё не установлена)
и `nvm use`. pnpm устанавливается отдельно: `npm install --global pnpm@12.18.0`
(Corepack не входит в Node.js 26). `engines.node` и `engineStrict: true` в `pnpm-workspace.yaml`
запрещают установку зависимостей на других мажорных версиях Node.
Install-скрипты зависимостей разрешаются явно через `allowBuilds` в `pnpm-workspace.yaml`.

## Что где

Рабочий код:

- `apps/web` — Next.js 16 (App Router, React 19). Роуты в `app/` (тонкие реэкспорты), FSD в `src/`;
  слои `app`/`pages` называются `_app`/`_pages` (гайд FSD для Next.js).
- `apps/api` — NestJS 12 + Prisma + Swagger. Глобальный префикс `api/v1`, модули в `src/modules/*`.
- `packages/contracts` — общие Zod-схемы HTTP-запросов/ответов и выведенные TS-типы.
  Без зависимостей от Nest, Prisma и React; см. ADR 0002.
- `packages/ui` — заготовка UI-кита (пока `export {}`).
- `packages/utils` — хелпер `cn` для CSS-классов.
- `packages/tailwind-config` — токены и тема.
- `packages/typescript-config` — общие tsconfig. Как устроены и какой пакет собирается — `docs/architecture.md`.

Пустые заготовки (только `.gitkeep`): `apps/landing`, `apps/ui-docs`, `apps/telegram-bot`.
Не ссылаться на них как на существующий код.

## Команды

```bash
pnpm infra:up          # docker: PostgreSQL
pnpm dev:web / dev:api
pnpm typecheck         # turbo, все workspaces
pnpm test              # тесты без запуска полного окружения
pnpm lint              # Biome (не ESLint/Prettier) + Steiger (правила FSD в apps/web)
pnpm lint:fix          # автоисправление Biome
pnpm lint:fsd          # только Steiger
pnpm db:migrate        # prisma migrate dev
```

Перед завершением задачи: `pnpm typecheck && pnpm lint`.

## Документация

- [Что строим](docs/product.md)
- [Устройство, границы и размещение кода](docs/architecture.md)
- [Архитектурные решения](docs/decisions/README.md)
- [FSD](docs/frontend/architecture/fsd.md) и [Next.js](docs/frontend/architecture/nextjs.md)
- [Frontend: данные, стили и сборка](docs/frontend/README.md) — на пересмотре
- [Backend: NestJS и Prisma](docs/backend/README.md)
- [Ветки, коммиты и PR](docs/pull-request.md)
- [Code review](docs/review.md)
- [Выбор и размещение тестов](docs/tests.md)

Если документ расходится с кодом, верить коду и указать на расхождение.

Документация библиотек — версии из `node_modules`, а не по памяти:

- Next.js — `apps/web/node_modules/next/dist/docs/` (Next 16: API и соглашения отличаются от 15).
