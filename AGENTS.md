# CollabBoard

Монорепозиторий (pnpm 9.15.4 + Turborepo, Node 26.x) для доски совместной работы.

Версия Node задана в `.nvmrc`: перед работой выполнить `nvm install` (если версия ещё не установлена)
и `nvm use`. pnpm устанавливается отдельно: `npm install --global pnpm@9.15.4`
(Corepack не входит в Node.js 26). `engines.node` и `.npmrc` запрещают установку зависимостей на других мажорных версиях Node.

## Что где

Рабочий код:

- `apps/web` — Next.js 16 (App Router, React 19). Роуты в `app/` (тонкие реэкспорты), FSD в `src/`;
  слои `app`/`pages` называются `_app`/`_pages` (гайд FSD для Next.js).
- `apps/api` — NestJS 11 + Prisma + Swagger. Глобальный префикс `api/v1`, модули в `src/modules/*`.
- `packages/contracts` — общие Zod-схемы HTTP-запросов/ответов и выведенные TS-типы.
  Без зависимостей от Nest, Prisma и React; см. ADR 0002.
- `packages/ui`, `utils`, `types`, `tailwind-config` — UI-кит, хелперы (`cn`), общие типы, токены и тема.
- `packages/typescript-config` — общие tsconfig. Как устроены и какой пакет собирается — `docs/architecture.md`.

Пустые заготовки (только `.gitkeep`): `apps/landing`, `apps/ui-docs`, `apps/telegram-bot`,
`packages/email`, `hooks`, `i18n`, `icons`. Не ссылаться на них как на существующий код.

## Команды

```bash
pnpm infra:up          # docker: PostgreSQL
pnpm dev:web / dev:api
pnpm typecheck         # turbo, все workspaces
pnpm lint              # Biome (не ESLint/Prettier) + Steiger (правила FSD в apps/web)
pnpm lint:fix          # автоисправление Biome
pnpm lint:fsd          # только Steiger
pnpm db:migrate        # prisma migrate dev
```

Перед завершением задачи: `pnpm typecheck && pnpm lint`.

## Правила

В процессе

## Документация

У каждого документа в начале статус. ✅ — описывает существующий код.
📐 / 💬 / 🚧 — план или черновик: **не считать описанное реализованным**.

| Область                              | Файл                              |
| ------------------------------------ | --------------------------------- |
| Что строим                           | `docs/product.md`                 |
| Устройство, границы, куда класть код | `docs/architecture.md`            |
| Решения и их статус                  | `docs/decisions/README.md`        |
| FSD / Next.js                        | `docs/frontend/architecture/*` ✅ |
| Данные / стили / сборка фронта       | `docs/frontend/*` (на пересмотре) |
| NestJS / Prisma                      | `docs/backend/*` (на пересмотре)  |
| Ветки, коммиты, PR                   | `docs/pull-request.md`            |
| Code review                          | `docs/review.md`                  |

Если документ расходится с кодом, верить коду и указать на расхождение.

Документация библиотек — версии из `node_modules`, а не по памяти:

- Next.js — `apps/web/node_modules/next/dist/docs/` (Next 16: API и соглашения отличаются от 15).
