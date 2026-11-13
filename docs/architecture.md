# Архитектура

> **Статус:** 🚧 Черновик · сверено с кодом 2026-11-11
> Описывает только то, что есть в репозитории. Планы — в [decisions/](./decisions/README.md).

## Карта

```text
apps/
  web/          Next.js 16 (App Router, React 19), роуты в app/, FSD в src/  → :3000
  api/          NestJS 12 + Prisma (PostgreSQL), Swagger, /api/v1      → :3001
  landing/      заготовка (.gitkeep)
  ui-docs/      заготовка под Storybook (.gitkeep)
  telegram-bot/ заготовка (.gitkeep)
packages/
  contracts/        общие Zod-схемы и TS-типы HTTP-контрактов (ADR 0002)
  ui/               UI-кит — пока пустой (export {})
  utils/            cn() и общие хелперы
  tailwind-config/  тема Tailwind 4 (theme.css): CSS-переменные, @theme, dark-вариант, цвета стикеров
  typescript-config/ общие tsconfig (base, nextjs, nestjs, compiled-package, jit-package)
infra (docker-compose.yml)
  PostgreSQL 16  :5432
```

## Сборка пакетов и tsconfig

Схема — из гайда Turborepo по [TypeScript](https://turborepo.dev/docs/guides/tools/typescript) и
[internal packages](https://turborepo.dev/docs/core-concepts/internal-packages).

Пакет собирается, только если его импортирует `apps/api`: Node не исполняет TS-исходники.

| Пакет                          | Стратегия Turbo | Как отдаётся                                                | Кто использует |
| ------------------------------ | --------------- | ----------------------------------------------------------- | -------------- |
| `contracts`, `utils`        | Compiled        | `tsc` → `dist/` (CommonJS); `exports.types` → `src/index.ts` | web, api       |
| `ui`                    | Just-in-Time    | `exports` → `src/*.ts` и `src/styles.css`, без сборки        | только web     |
| `tailwind-config`       | —               | только CSS: `exports` → `src/theme.css`, без TS и сборки     | только web     |

- `types` указывает на исходники, поэтому `typecheck` не ждёт `build`. tsc считает файлы,
  найденные через `node_modules`, внешними: проверяет их, но не кладёт в `dist` приложения.
- Web компилирует TS-пакеты `@packages/*` через `transpilePackages`.
- Версия TypeScript одна на весь репозиторий — `catalog` в `pnpm-workspace.yaml`.

### tsconfig

Общие конфиги — пакет `@packages/typescript-config` (devDependency `workspace:*`). Turbo видит его как
зависимость: правка конфига сбрасывает кэш `typecheck` у всех, кто его использует. Корневого `tsconfig.json` нет.

| Файл                    | Для чего                    | Главное                                                                 |
| ----------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `base.json`             | основа всех                 | `NodeNext`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes` |
| `nextjs.json`           | `apps/web`                  | `Bundler`, DOM, `jsx: preserve`, `noEmit`, плагин `next`                |
| `nestjs.json`           | `apps/api`                  | декораторы и метаданные, `isolatedModules: false`, `target: ES2021`     |
| `compiled-package.json` | `contracts`, `utils`     | `rootDir`/`outDir`/`include` через `${configDir}` — tsconfig пакета из одной строки |
| `jit-package.json`      | `ui`                    | `Bundler`, DOM, `jsx: react-jsx`, `noEmit`                           |

- TypeScript 6: умолчания (`strict`, `esModuleInterop`, `types: []`, `noUncheckedSideEffectImports`) в конфигах
  не повторяются. Глобальные типы (например, `node`) подключаются явно там, где нужны.
- `apps/api`: `target: ES2021`, потому что с ES2022+ включается `useDefineForClassFields` и меняется
  семантика полей классов. Оставлено, как в шаблоне Nest. `tsconfig.json` — для редактора и `typecheck`
  (включая `prisma/`), `tsconfig.build.json` — для `nest build` (`rootDir: src`, только код приложения).
- `apps/api` — ES-модули (`"type": "module"`): пакеты Nest 12 выходят только как ESM. С `NodeNext`
  относительные импорты пишутся с `.js` (`./app.module.js`), вместо `__dirname` — `import.meta.dirname`.
  Seed запускается через `tsx`. Пакеты `contracts`, `utils` остаются CommonJS и импортируются из ESM напрямую.
- `allowJs` и `incremental` в `nextjs.json` Next добавляет сам, если их нет.
