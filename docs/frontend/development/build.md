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
| **Проверка линтером (Biome)** | `pnpm lint` |
| **Автоисправление линтера** | `pnpm lint:fix` |
| **Форматирование кода** | `pnpm format` |
| **Полный цикл генерации API (OpenAPI + Orval)** | `pnpm codegen` |
| **Генерация только OpenAPI схемы** | `pnpm generate:api` |
| **Генерация только клиента Orval** | `pnpm generate:client` |
| **Проверка синхронизации клиента в CI** | `pnpm codegen:check` |

---

## 2. Граф сборки Turborepo

В файле `turbo.json` настроен граф задач:
* `build`: сборка пакетов запускается с учетом зависимостей (`dependsOn: ["^build"]`).
* `typecheck`: зависит от собранных общих пакетов (`dependsOn: ["^build"]`).

```text
web#build
  ├── @packages/ui#build
  ├── @packages/dto#build
  ├── @packages/api#build
  └── @packages/tailwind-config#build
```
Turborepo автоматически кэширует результаты сборки на диске (`.turbo`), что обеспечивает мгновенные повторные прогоны команд (FULL TURBO).
