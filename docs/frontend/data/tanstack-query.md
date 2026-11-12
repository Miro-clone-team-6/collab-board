# TanStack Query

> Статус: ✅ Описывает текущий health-запрос.

`QueryClient` и провайдер находятся в
`apps/web/src/_app/entrypoint/QueryProvider.tsx`, подключены через `AppProviders`.

`HomePage` вызывает `useQuery` с ключом `["health"]` и функцией `getHealth`
из `shared/api/get-health.ts`. Функция использует fetch через Next-прокси `/api/*`
и проверяет ответ Zod-схемой из `@packages/contracts`. Сигнал отмены передаётся
из React Query в fetch.

Orval и сгенерированных хуков нет — [ADR 0002](../../decisions/0002-shared-contracts.md).
Запросы бизнес-сущностей размещаем по правилам [FSD](../architecture/fsd.md).
Серверные данные храним в кэше Query, без копирования в отдельный глобальный store.
