# Архитектура

## Границы

`apps/web` — интерфейс на Next.js. `apps/api` — отдельное HTTP-приложение на NestJS.
В локальной разработке web слушает порт 3000, API — 3001.

```text
Браузер → Next.js /api/* → NestJS /api/v1/* → PostgreSQL
                              ↑
                     packages/contracts
```

Next.js проксирует `/api/*` на адрес API из `NEXT_PUBLIC_API_URL`.
API принимает HTTP-запросы, выполняет серверную логику и работает с PostgreSQL
через Prisma. Прямого доступа фронтенда к БД и исходникам API нет.
Схемы JSON и типы запросов/ответов общие; код приложений развивается отдельно.
Устройство HTTP-контрактов — в [backend](backend/README.md#http-контракты).

Сейчас API реализует только healthcheck. Авторизации, досок, WebSocket,
Redis и фоновых задач нет. PostgreSQL 16 запускается из `docker-compose.yml`.

## Общие пакеты

| Пакет | Содержимое | Выдача кода |
| --- | --- | --- |
| `contracts` | Zod-схемы HTTP и выведенные типы | `tsc` → `dist/` |
| `utils` | Хелпер `cn` | `tsc` → `dist/` |
| `ui` | Заготовка UI-кита (`export {}`) | Исходники |
| `tailwind-config` | Тема и токены | Исходники и CSS |
| `typescript-config` | Общие настройки TypeScript | JSON-конфиги |

`contracts` и `utils` публикуют типы из `src/`, исполняемый CommonJS-код —
из `dist/`. API использует `contracts`; web использует общие пакеты через
`transpilePackages`. Общие пакеты не импортируют код из `apps/`.

`apps/landing`, `apps/ui-docs`, `apps/telegram-bot` содержат только `.gitkeep`.

## Зависимости и сборка

- Корневой `package.json` содержит команды репозитория и инструменты разработки.
- `package.json` приложения или пакета содержит его зависимости и команды.
- `pnpm-workspace.yaml` задаёт workspaces, версии общих зависимостей (`catalog`)
  и разрешённые install-скрипты (`allowBuilds`). Зависимости только одного
  приложения хранят версии в его `package.json`.
- `pnpm-lock.yaml` фиксирует разрешённые версии всего дерева; его обновляет pnpm.
- `turbo.json` задаёт порядок задач и кэш. `build` и `dev` сначала выполняют
  сборку зависимых пакетов. `pnpm dev` запускает web и API через Turbo watch.

## TypeScript

Каждый workspace имеет свой `tsconfig.json`, наследующий конфиг из
`packages/typescript-config`. Корневого tsconfig нет.

| Конфиг | Назначение |
| --- | --- |
| `base.json` | Общие настройки, `NodeNext` и проверки типов |
| `nestjs.json` | Декораторы Nest, метаданные и типы Node |
| `nextjs.json` | Next.js, JSX, DOM и проверка без выдачи JS |
| `compiled-package.json` | Сборка `src/` в `dist/` |
| `jit-package.json` | Пакеты, исходники которых обрабатывает приложение |

API работает как ESM: относительные импорты имеют расширение `.js`,
пути к файлам вычисляются через `import.meta.dirname`.
`apps/api/tsconfig.json` проверяет приложение, сиды и Prisma config;
`tsconfig.build.json` собирает только `src/` в `dist/`.

Детали: [backend](backend/README.md), [frontend](frontend/README.md).
