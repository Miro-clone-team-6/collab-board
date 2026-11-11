# CollabBoard

Монорепозиторий (pnpm 9 + Turborepo, Node ≥ 22) для доски совместной работы.

## Что где

Рабочий код:

- `apps/web` — Next.js 15 (App Router, React 19), FSD в `src/`.
- `apps/api` — NestJS 11 + Prisma + Swagger. Глобальный префикс `api/v1`, модули в `src/modules/*`.
- `packages/api` — клиент API (Orval). **Генерация отложена и Orval убирается** — см. ADR 0001, не развивать.
- `packages/dto` — Zod-схемы (Rslib, ESM + CJS). Роль пакета не решена — см. ADR 0001.
- `packages/ui`, `utils`, `types`, `tailwind-config` — UI-кит, хелперы (`cn`), общие типы, токены и тема.

Пустые заготовки (только `.gitkeep`): `apps/landing`, `apps/ui-docs`, `apps/telegram-bot`,
`packages/email`, `hooks`, `i18n`, `icons`. Не ссылаться на них как на существующий код.

## Команды

```bash
pnpm infra:up          # docker: БД, Redis и т.п.
pnpm dev:web / dev:api
pnpm typecheck         # turbo, все workspaces
pnpm lint / lint:fix   # Biome (не ESLint/Prettier)
pnpm test
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
| FSD / Next.js / стили                | `docs/frontend/*` (на пересмотре) |
| NestJS / Prisma                      | `docs/backend/*` (на пересмотре)  |
| Ветки, коммиты, PR                   | `docs/pull-request.md`            |
| Code review                          | `docs/review.md`                  |

Если документ расходится с кодом, верить коду и указать на расхождение.
