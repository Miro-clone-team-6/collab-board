# Next.js в `apps/web`

Как в `apps/web` устроены роуты, серверные и клиентские компоненты и связь с API.
Слои и правила импортов — в [FSD](fsd.md). Как работает сам Next, описано в документации
версии из проекта: `apps/web/node_modules/next/dist/docs/`.

## Роутинг и FSD

Роутер Next лежит в корне `apps/web/app/`, слои FSD — в `apps/web/src/`. Так устроен
[гайд FSD для Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs): Next
игнорирует `src/app`, если в корне есть `app/`, поэтому `src/` целиком принадлежит FSD.
Слои `app` и `pages` называются `_app` и `_pages`, чтобы Next не принял их за свои роутеры.

`app/` содержит только роутинг. `page.tsx` реэкспортирует страницу из `src/_pages`,
а экран собирается в слайсе страницы из виджетов, фич и сущностей:

```text
app/boards/page.tsx → src/_pages/boards → widgets/header, widgets/board-list → entities/board
```

`app/layout.tsx` подключает глобальные стили (`src/_app/styles/globals.css`) и провайдеры
`AppProviders` из `src/_app/entrypoint/`: тему `next-themes` и `QueryClient` TanStack Query.

Специальные файлы Next (`loading.tsx`, `error.tsx`, `not-found.tsx`) кладутся в `app/` рядом
с роутом. `proxy.ts` (в Next 16 так переименован `middleware.ts`) и `instrumentation.ts` —
в корень `apps/web/`.

## Серверные и клиентские компоненты

Компоненты App Router по умолчанию серверные. `"use client"` нужен для хуков React,
обработчиков событий и клиентских библиотек вроде TanStack Query. Директива ставится
на самый нижний компонент, которому она нужна, а не на всю страницу: всё, что он
импортирует, тоже попадает в клиентский бандл.

Серверный код слайса экспортируется из отдельного `index.server.ts`. Если смешать его
с клиентским в `index.ts`, импорт слайса из клиентского компонента ломает сборку.

`BoardsPage` — серверный компонент. `HomePage` целиком клиентский из-за `useQuery`
health-запроса: это заглушка, а не образец.

## Запросы к API

`next.config.ts` проксирует `/api/*` на адрес из `NEXT_PUBLIC_API_URL`
(по умолчанию `http://localhost:3001`). Клиент обращается к своему origin по
относительному пути (`/api/v1/health`), поэтому CORS не нужен.

Пакеты монорепозитория web берёт из исходников: Next компилирует их по списку
`transpilePackages` в `next.config.ts`. Новый пакет, который импортирует web,
добавляется в этот список.

## Структура `apps/web`

Пути относительно `apps/web/`.

| Путь | Назначение |
| --- | --- |
| `app/` | Роуты Next: `layout.tsx`, `page.tsx`, `boards/page.tsx` |
| `src/` | Слои FSD |
| `next.config.ts` | Прокси `/api/*`, `transpilePackages`, `typedRoutes` |
| `tsconfig.json` | Алиас `@/*` → `src/*` |
| `postcss.config.mjs` | Реэкспорт PostCSS-конфига из `@packages/ui` |
| `steiger.config.ts` | Правила FSD для `pnpm lint:fsd` |
| `.env.example` | `NEXT_PUBLIC_API_URL` — адрес API для прокси; `NEXT_PUBLIC_APP_URL` в коде пока не используется |

## Добавить страницу

1. Создать слайс `src/_pages/<name>/`: компонент в `ui/<Name>Page.tsx`, экспорт в `index.ts`.
2. Создать роут `app/<route>/page.tsx` с реэкспортом:

   ```tsx
   export { BoardsPage as default } from "@/_pages/boards";
   ```

3. Ссылаться на страницу строкой: `<Link href="/boards">`. Список роутов вести не нужно,
   его генерирует Next — см. [TypeScript](#typescript).
4. Проверить: страница открывается в `pnpm dev:web`, `pnpm typecheck` и `pnpm lint:fsd` проходят.

Если роут принимает параметры, `page.tsx` получает их как `Promise` и передаёт странице.
Тип пропсов даёт глобальный хелпер `PageProps` по пути роута
(условный пример, такого роута ещё нет):

```tsx
// app/boards/[id]/page.tsx
import { BoardWorkspacePage } from "@/_pages/board-workspace";

export default async function Page(props: PageProps<"/boards/[id]">) {
  const { id } = await props.params;
  return <BoardWorkspacePage boardId={id} />;
}
```

## TypeScript

- `pnpm typecheck` в web запускает `next typegen` перед `tsc`. Typegen создаёт
  `next-env.d.ts` и типы роутов в `.next/types`; без них на чистом клоне проверка
  пропсов страниц молча пропускается. `next-env.d.ts` генерируется и лежит в `.gitignore`.
- `typedRoutes: true` в `next.config.ts` включает проверку путей. Next собирает роуты
  из `app/` в `.next/types/routes.d.ts`: по нему редактор подсказывает пути, а `tsc`
  не пропускает несуществующие в `Link` и `router.push`.
- Если путь передаётся в проп или хранится в объекте, его тип — `Route` из `next`.
  Тогда он проверяется так же, как в `Link`.
