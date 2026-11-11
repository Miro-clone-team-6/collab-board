# 🌐 Next.js 15 App Router & React 19

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Веб-приложение `apps/web` построено на базе **Next.js 15 (App Router)** и **React 19**.

---

## 1. Интеграция Next.js App Router и FSD

В Next.js App Router директория `src/app` является файловым маршрутизатором. Чтобы подружить файловый роутинг с архитектурой FSD:

1. **`src/app` содержит только роуты и глобальную обвязку:**
   - `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `providers/`.
2. **Файлы `page.tsx` должны быть максимально «тонкими»:**
   - `page.tsx` только принимает параметры URL и рендерит готовую страницу из `src/pages/...` или композицию виджетов.

### Пример тонкого роута:
```tsx
// apps/web/src/app/board/[id]/page.tsx
import { BoardWorkspacePage } from "@/pages/board-workspace";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Route({ params }: Props) {
  const { id } = await params;
  return <BoardWorkspacePage boardId={id} />;
}
```

---

## 2. Server Components vs Client Components

В Next.js App Router все компоненты по умолчанию являются **Server Components (RSC)**.

### Где ставить границу `'use client'`?

| Задача | Где выполняется |
|---|---|
| Начальная загрузка страницы, SEO-метатеги, layout | **Server Component** |
| Интерактивный бесконечный холст (движение мыши, зум, клики) | **Client Component** (`'use client'`) |
| React-хуки (`useState`, `useEffect`, `useRef`) | **Client Component** (`'use client'`) |
| Клиентские библиотеки (Zustand, React Hook Form, TanStack Query) | **Client Component** (`'use client'`) |

> 💡 **Правило:** Директива `'use client'` добавляется на **минимально возможном листовом уровне** дерева компонентов, а не на всю страницу.

---

## 3. Проксирование API (Rewrites в `next.config.ts`)

Чтобы клиентские запросы к бэкенду шли без проблем с CORS в локальной разработке и продакшене, в `apps/web/next.config.ts` настроены rewrites:

```typescript
// apps/web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@packages/ui",
    "@packages/dto",
    "@packages/types",
    "@packages/utils",
    "@packages/api",
    "@packages/tailwind-config",
  ],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```
