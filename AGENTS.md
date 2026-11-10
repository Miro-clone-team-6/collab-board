# CollabBoard — правила AI Code Review

## 1. Общая информация

CollabBoard — монорепозиторий на pnpm и Turborepo для интерактивной доски совместной работы.

Основные приложения:

- `apps/web` — основное frontend-приложение (Next.js 15, FSD);
- `apps/landing` — landing (Next.js);
- `apps/api` — NestJS backend (Prisma, Swagger);
- `apps/ui-docs` — Storybook / документация UI.

Основные packages:

- `packages/ui` — общий UI Kit;
- `packages/api` — generated/typed API client (Orval, TanStack Query);
- `packages/dto` — общие Zod DTO (Rslib Dual ESM/CJS);
- `packages/tailwind-config` — дизайн-токены, цвета стикеров/холста и CSS-тема;
- `packages/types` — общие TypeScript types;
- `packages/utils` — общие utilities (cn, хелперы);
- `packages/icons` — иконки.

## 2. Общий принцип review

Проводить review на уровне Senior Engineer.

В первую очередь искать:

- реальные bugs;
- security issues;
- ошибки бизнес-логики;
- regressions;
- нарушения API-контрактов;
- проблемы с целостностью данных;
- race conditions;
- resource leaks;
- concurrency issues;
- существенные performance problems;
- архитектурные нарушения;
- проблемы с error handling;
- проблемы type safety.

Не создавать замечания ради количества.

Не указывать на:

- форматирование;
- субъективный naming;
- личные предпочтения по стилю;
- trivial refactoring;
- альтернативную реализацию, если текущая корректна;
- теоретические проблемы без реального impact.

Каждое замечание должно содержать:

1. Что именно неправильно.
2. Почему это проблема.
3. Какой возможный impact.
4. Как исправить, если решение очевидно.

## 3. Source of Truth

Перед архитектурными замечаниями использовать соответствующую
документацию проекта.

### Общая документация

- `README.md`
- `docs/pull-request.md`

### Frontend

- `docs/frontend/README.md`
- `docs/frontend/data/api-contracts.md`
- `docs/frontend/ui/storybook.md`
- `docs/frontend/ui/ui-kit.md`

### Storage

- `docs/STORAGE_S3.md`

### Email & Notifications

- `docs/EMAIL_ARCHITECTURE.md`

### Localization

- `docs/I18N.md`

### Releases

- `docs/RELEASES.md`

Если предлагаемое изменение явно меняет существующую архитектуру,
не считать старую документацию автоматически причиной для reject.
Проверять, описано ли изменение архитектуры в PR.

## 4. Monorepo

Соблюдать границы между `apps/*` и `packages/*`.

Перед добавлением новой общей функциональности проверить,
существует ли уже подходящий `package`.

Не дублировать существующую функциональность.

Перед добавлением новой dependency проверить:

- нет ли уже аналогичной зависимости;
- в какой workspace она должна находиться;
- нужна ли она в runtime;
- не создаёт ли она unnecessary duplication.

Изменения в shared packages рассматривать как потенциально
влияющие на несколько приложений.

## 5. Frontend

`apps/web` использует Next.js App Router и FSD.

Проверять:

- Server Components / Client Components;
- `"use client"`;
- server/client boundaries;
- hydration;
- unnecessary Client Components;
- unnecessary `useEffect`;
- unnecessary state;
- stale closures;
- dependencies effects;
- async behavior;
- race conditions;
- unnecessary rerenders;
- loading/error/empty states;
- API integration;
- accessibility;
- performance;
- type safety.

Не считать расположение файла нарушением FSD само по себе.
Архитектурное нарушение должно подтверждаться зависимостями
и правилами проекта.

## 6. Landing

`apps/landing` — отдельное Next.js приложение.

Проверять:

- Server/Client Components;
- SSR/SSG;
- hydration;
- metadata;
- SEO;
- accessibility;
- performance;
- unnecessary client-side JavaScript;
- unnecessary `useEffect`;
- type safety;
- i18n;
- responsive behavior.

## 7. Backend

`apps/api` — NestJS backend.

Проверять:

- authentication;
- authorization;
- validation;
- DTO;
- business logic;
- HTTP status codes;
- error handling;
- transactions;
- race conditions;
- database consistency;
- N+1;
- performance;
- sensitive data exposure;
- API contract;
- backwards compatibility.

При изменении API проверять цепочку:

```text
NestJS
  ↓
OpenAPI
  ↓
Orval
  ↓
packages/api
  ↓
TanStack Query
  ↓
Frontend
