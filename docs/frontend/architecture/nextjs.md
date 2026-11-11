# 🌐 Next.js 16 App Router & React 19

> **Статус:** ✅ Сверено с кодом 2026-11-11. Пример роута `board/[id]` условный — такого роута ещё нет.

`apps/web` — Next.js 16.4 (App Router, Turbopack в `dev` и `build`) и React 19.3.

## 1. Next.js и FSD

Следуем [гайду FSD для Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs):

```text
apps/web/
├── app/            # роутер Next.js: сейчас layout.tsx и page.tsx
└── src/            # только слои FSD, см. fsd.md
    ├── _app/
    ├── _pages/
    └── widgets/ features/ entities/ shared/
```

1. **Корневой `app/` — только роутинг.** Next ищет `app/` в корне раньше, чем в `src/`, поэтому
   `src/` целиком принадлежит FSD. Здесь же — `loading.tsx`, `error.tsx`, `not-found.tsx`, когда понадобятся.
2. **Слои `app` и `pages` с префиксом `_`**, чтобы Next не принял их за App Router / Pages Router.
3. **`page.tsx` — тонкие:** реэкспорт страницы из `src/_pages` или приём параметров URL. Сейчас:
   ```tsx
   // apps/web/app/page.tsx
   export { HomePage as default } from "@/_pages/home";
   ```
4. **`middleware.ts` и `instrumentation.ts`** (когда появятся) — в корне `apps/web/`, рядом с `app/`.
5. **Серверный код слайса** экспортируется из отдельного `index.server.ts`, иначе импорт слайса
   из клиентского компонента ломает сборку.

Роут с параметрами (условный пример):

```tsx
// apps/web/app/board/[id]/page.tsx
import { BoardWorkspacePage } from "@/_pages/board-workspace";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Route({ params }: Props) {
  const { id } = await params;
  return <BoardWorkspacePage boardId={id} />;
}
```

## 2. Server vs Client Components

По умолчанию компоненты App Router — **Server Components**.

| Задача | Где выполняется |
|---|---|
| Начальная загрузка страницы, метатеги, layout | **Server Component** |
| Интерактивный холст (мышь, зум, клики) | **Client Component** (`"use client"`) |
| Хуки React (`useState`, `useEffect`, `useRef`) | **Client Component** |
| Клиентские библиотеки (TanStack Query; Zustand и React Hook Form — пока не установлены) | **Client Component** |

`"use client"` ставится на **самом нижнем возможном уровне** дерева, а не на всю страницу.

Сейчас это правило нарушает `HomePage`: заглушка целиком клиентская и ходит в API через
`@packages/api`, который убирается ([ADR 0001](../../decisions/0001-api-contracts.md)). Подробнее —
[fsd.md](./fsd.md#что-есть-сейчас).

## 3. Проксирование API

[`apps/web/next.config.ts`](../../../apps/web/next.config.ts) переписывает `/api/*` на бэкенд
(`NEXT_PUBLIC_API_URL`, по умолчанию `http://localhost:3001`), поэтому клиент ходит на свой origin и CORS не нужен.

Там же `transpilePackages` со всеми `@packages/*`, включая `@packages/api`, — уйдёт вместе с ним.

## 4. Импорт глобальных стилей и TypeScript

`app/layout.tsx` подключает стили импортом ради сайд-эффекта: `import "@/_app/styles/globals.css"`.

- В `tsconfig.json` включён `noUncheckedSideEffectImports`: TypeScript проверяет, что импорты ради
  сайд-эффекта разрешаются в исходник TS. Ловит опечатки вроде `import "server-onyl"` (TS2307).
  В TS 6 флаг включён по умолчанию, явная настройка выравнивает поведение с TS 5.9 из проекта.
- `.css` для TypeScript не исходник, даже если файл существует. Next (с 16.2) объявляет
  `declare module '*.css' {}` в `next/types/global.d.ts` — решение из
  [документации TS](https://www.typescriptlang.org/tsconfig/#noUncheckedSideEffectImports).
  Типы приходят через `next-env.d.ts`, своего объявления в проекте нет.
- Объявление разрешает любой путь `*.css`, поэтому опечатки в путях к CSS TypeScript **не ловит**.
  Их ловит сборщик Next: `next dev` / `next build` падают с «Module not found».
- `next-env.d.ts` генерирует Next (`next dev` / `next build` / `next typegen`), файл в `.gitignore` —
  [по документации Next](https://nextjs.org/docs/app/api-reference/config/typescript#next-envdts).
  Скрипт `typecheck` в web запускает `next typegen` перед `tsc`: без него на чистом клоне нет
  `next-env.d.ts` и типов роутов из `.next/types`, и проверка пропсов страниц молча пропускается.
- Редактор должен использовать TypeScript из проекта, а не встроенный: «TypeScript: Select TypeScript Version»
  → «Use Workspace Version» (или `"typescript.tsdk": "node_modules/typescript/lib"`). Иначе редактор и
  `pnpm typecheck` расходятся.
