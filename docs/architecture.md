# Архитектура

Монорепозиторий на pnpm workspaces и Turborepo: приложения `apps/web` и `apps/api`,
общий код — в `packages/`.

## Границы

```text
Браузер → Next.js /api/* → NestJS /api/v1/* → PostgreSQL
                              ↑
                     packages/contracts
```

- Web обращается к API только по HTTP через прокси Next. К БД и коду API доступа нет.
- Общий код приложений — только через `packages/*`: схемы запросов и ответов лежат
  в `packages/contracts`. Пакеты не импортируют код из `apps/`.

## Зависимости

- Зависимость нужна в нескольких workspaces — её версия задаётся в `catalog`
  в `pnpm-workspace.yaml`, а в `package.json` пишется `"catalog:"`.
- У новой зависимости есть install-скрипт — `pnpm install` падает с `ERR_PNPM_IGNORED_BUILDS`
  и добавляет её в `allowBuilds` в `pnpm-workspace.yaml`. Там поставить `true`, если скрипт
  нужен для работы, или `false` с комментарием, почему не нужен.
