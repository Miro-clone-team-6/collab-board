# Архитектура

> **Статус:** 🚧 Черновик · сверено с кодом 2026-11-11
> Описывает только то, что есть в репозитории. Планы — в [decisions/](./decisions/README.md).

## Карта

```text
apps/
  web/          Next.js 15 (App Router, React 19), FSD в src/         → :3000
  api/          NestJS 11 + Prisma (PostgreSQL), Swagger, /api/v1      → :3001
  landing/      заготовка (.gitkeep)
  ui-docs/      заготовка под Storybook (.gitkeep)
  telegram-bot/ заготовка (.gitkeep)
packages/
  api/              клиент API от Orval — убирается (ADR 0001 ⏸)
  dto/              Zod-схемы (ESM + CJS через Rslib) — роль обсуждается, см. ADR 0001
  ui/               UI-кит — пока пустой (export {})
  utils/            cn() и общие хелперы
  types/            общие TS-типы
  tailwind-config/  тема (theme.css) и токены холста/стикеров (tokens.ts)
  email/ hooks/ i18n/ icons/   заготовки (.gitkeep)
infra (docker-compose.yml)
  PostgreSQL 16  :5432
  Redis 7        :6379  — поднимается, приложением пока не используется
```
