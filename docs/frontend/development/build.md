# 🛠 Сборка и команды разработки (Build & Tooling)

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Вся сборка монорепозитория управляется через **Turborepo** и **pnpm workspaces**.

---

## 1. Сводная таблица команд

| Действие | Команда |
|---|---|
| **Установка всех зависимостей** | `pnpm install` |
| **Запуск всех приложений в dev-режиме** | `pnpm dev` |
| **Запуск только фронтенда (Next.js)** | `pnpm dev:web` |
| **Запуск только бэкенда (NestJS)** | `pnpm dev:api` |
| **Сборка всего проекта (Production build)** | `pnpm build` |
| **Сборка только Next.js** | `pnpm build:web` (или `pnpm --filter web build`) |
| **Сборка только NestJS** | `pnpm build:api` (или `pnpm --filter api build`) |
| **Проверка типов (Typecheck)** | `pnpm typecheck` |
| **Проверка линтерами (Biome + Steiger)** | `pnpm lint` |
| **Только правила FSD (Steiger)** | `pnpm lint:fsd`, см. [fsd.md](../architecture/fsd.md#5-проверка-steiger) |
| **Автоисправление Biome** | `pnpm lint:fix` |
| **Форматирование кода** | `pnpm format` |

---

## 2. Граф сборки Turborepo

В файле `turbo.json` настроен граф задач:
* `build`: сборка пакетов запускается с учетом зависимостей (`dependsOn: ["^build"]`).
* `typecheck`: `dependsOn: ["topo"]`, где `topo` — пустая задача с `dependsOn: ["^topo"]` (приём из гайда Turborepo).
  Проверки идут параллельно, но кэш сбрасывается при изменении зависимостей. Сборка не нужна: `types` пакетов указывает на `src`.
* `lint:biome`: корневая задача (`//#lint:biome`), Biome проверяет весь репозиторий одним запуском — как советует [гайд Turborepo](https://turborepo.dev/docs/guides/tools/biome). Скриптов `lint` в пакетах нет.
* `lint:fsd`: Steiger, без зависимостей; кэш по исходникам FSD и `tsconfig` — см. [fsd.md](../architecture/fsd.md#5-проверка-steiger).

```text
web#build
  ├── @packages/contracts#build
  ├── @packages/utils#build
  └── @packages/types#build
```

`contracts`, `utils`, `types` собирает `tsc` в CommonJS. `ui` и `tailwind-config` не собираются: `exports` указывает на `src/*.ts`, Next компилирует их
через `transpilePackages`. Подробнее — [architecture.md](../../architecture.md).
Turborepo автоматически кэширует результаты сборки на диске (`.turbo`), что обеспечивает мгновенные повторные прогоны команд (FULL TURBO).

Контракты импортируются из `@packages/contracts`; генерации клиента нет.
Решение — [ADR 0002](../../decisions/0002-shared-contracts.md).
