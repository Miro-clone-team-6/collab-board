# 0001. Генерация API-клиента: OpenAPI → Orval → TanStack Query

- **Статус:** ⏸ Отложено
- **Дата:** 2026-11-11

> Orval убирается из проекта. Документ сохранён как описание подхода на случай, если к нему вернёмся.

## Контекст

Фронтенд должен вызывать API без ручного дублирования типов, а изменение контракта на бэкенде
должно ломать `pnpm typecheck` на фронте.

## Как работал конвейер

Был собран и проверен на модуле `health` (2026-11-11: `pnpm codegen` дал клиент, идентичный закоммиченному).

```text
apps/api: контроллер + DTO-класс с @ApiProperty
   │  pnpm generate:api   — scripts/generate-openapi.ts поднимает Nest в памяти (БД и Docker не нужны)
   ▼
apps/api/openapi/openapi.json (+ .yaml)
   │  pnpm generate:client — Orval по orval.config.ts (mode: tags-split, client: react-query, clean: true)
   ▼
packages/api/src/generated/endpoints/<тег>/<тег>.ts   функции, хуки, query keys
packages/api/src/generated/model/*.ts                 типы
   │  import { ... } from "@packages/api"
   ▼
apps/web
```

- `pnpm codegen` = `generate:api` + `generate:client`; `pnpm codegen:check` падает, если клиент устарел.
- Имена: `HealthController.check` → `useHealthControllerCheck`, `getHealthControllerCheckQueryKey`.
- `@ApiTags("Health")` → папка и файл `endpoints/health/health.ts`.
- Поле DTO без `@ApiProperty()` не попадает в схему → на фронте `unknown`.
- Все запросы шли через `customInstance` в `packages/api/src/transport.ts` (`NEXT_PUBLIC_API_URL`,
  `credentials: "include"`, JSON, ошибка с сообщением сервера на 4xx/5xx).
- Сгенерированные файлы коммитились вместе с изменением контроллера; руками не редактировались.

Пример использования:

```tsx
"use client";
import {
  useHealthControllerCheck,
  getHealthControllerCheckQueryKey,
} from "@packages/api";

const { data, isLoading, error } = useHealthControllerCheck();
queryClient.invalidateQueries({ queryKey: getHealthControllerCheckQueryKey() });
```

## Открытые вопросы (если вернёмся)

1. **Источник правды для DTO.** Одна структура описывалась трижды: Zod-схема в `@packages/dto`,

   класс в `apps/api`, модель от Orval. Варианты:
   - Zod в `@packages/dto` — единственный источник; валидация и OpenAPI из Zod (`nestjs-zod` / `zod-to-openapi`);
   - классы с `class-validator` + `@ApiProperty`, фронт получает типы только через генерацию.

2. **Сгенерированные хуки и FSD.** Хуки вида `useXControllerY` протекают во все слои; возможно, нужна

   обёртка в `entities/*/api`.

3. **Генерация в CI** (`codegen:check`).

## Решение

Сейчас генерацию клиента не используем. Как фронтенд вызывает API и где описаны типы запросов/ответов —
нужно отдельное решение (новый ADR).

## Последствия

- Убрать: `orval` из devDependencies, `orval.config.ts`, `packages/api/src/generated`, скрипты
  `generate:client` / `codegen` / `codegen:check`, использование хука в `apps/web/src/_pages/home/ui/HomePage.tsx`.
- Выгрузка OpenAPI в файлы удалена. Swagger UI и `/docs-json` остаются;
  сохранившийся генератор клиента читает `/docs-json` запущенного API (`OPENAPI_URL`).
- Валидации входящих данных в API по-прежнему нет — решить отдельно.
