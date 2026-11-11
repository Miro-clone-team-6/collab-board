# 🏛 Feature-Sliced Design (FSD) в CollabBoard

> **Статус:** ✅ Сверено с кодом 2026-11-11. Примеры слайсов (`board-canvas`, `add-sticky-note` и т. п.)
> условные — показывают, куда класть код, а не то, что уже есть.

`apps/web` следует [Feature-Sliced Design v2](https://feature-sliced.design) и
[гайду FSD для Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs): роутер Next лежит в
корне `apps/web/app/`, а слои `app` и `pages` в `src/` называются `_app` и `_pages`, чтобы Next не принимал
их за App Router / Pages Router. Подробнее — [nextjs.md](./nextjs.md).

## 1. Слои

Сверху вниз по уровню абстракции:

```text
apps/web/
├── app/             # роутер Next.js (не слой FSD): тонкие реэкспорты из src/_pages
└── src/
    ├── _app/        # 1. Инициализация: провайдеры, глобальные стили
    ├── _pages/      # 2. Страницы: композиция виджетов в готовые экраны
    ├── widgets/     # 3. Крупные самостоятельные UI-блоки
    ├── features/    # 4. Действия пользователя
    ├── entities/    # 5. Доменные сущности
    └── shared/      # 6. Код вне домена
        ├── api/     #    клиент и запросы к бэкенду
        ├── config/  #    конфигурация, env
        ├── lib/     #    утилиты и хуки общего назначения
        └── ui/      #    UI-примитивы, специфичные для apps/web
```

Сегменты называются по назначению (`ui`, `api`, `model`, `lib`, `config`), а не по виду кода:
сегментов `hooks`, `types`, `components` нет. Хуки живут в `lib` или `model`, типы — рядом с кодом,
который их использует.

### Что есть сейчас

| Путь | Содержимое |
|---|---|
| `src/_app/providers/` | `AppProviders` (next-themes + TanStack Query), `QueryProvider` |
| `src/_app/globals.css` | Тема из `@packages/tailwind-config` и директивы Tailwind |
| `src/_pages/home/` | `HomePage` — базовый пример страницы, см. ниже |
| `widgets/`, `features/`, `entities/`, `shared/*` | Пустые (`.gitkeep`) |

`HomePage` — заглушка: вся страница помечена `"use client"` и напрямую вызывает
`useHealthControllerCheck` из `@packages/api`. Оба момента противоречат правилам ниже и
[nextjs.md](./nextjs.md): `@packages/api` убирается ([ADR 0001](../../decisions/0001-api-contracts.md)),
а `"use client"` должен стоять на листовом компоненте. Не копировать как образец.

## 2. Ответственность слоёв

| Слой | Ответственность | Пример (условный) | Чего НЕ должно быть |
|---|---|---|---|
| **`_app/`** | Глобальные провайдеры, стили | `providers/QueryProvider.tsx` | Роутов Next.js, бизнес-логики |
| **`_pages/`** | Композиция экрана из виджетов | `_pages/board-workspace` | Прямых сетевых вызовов |
| **`widgets/`** | Крупные составные UI-блоки | `board-canvas`, `board-toolbar` | Дублирования логики фич |
| **`features/`** | Действия пользователя («что делает?») | `add-sticky-note`, `export-board` | Знания о других фичах |
| **`entities/`** | Доменные сущности («с чем работает?») | `board`, `canvas-element`, `cursor` | Интерактивных действий и форм |
| **`shared/`** | Переиспользуемый код вне домена | `shared/ui/button`, `shared/lib/canvas-math.ts` | Знания о Board или User |

## 3. Направление зависимостей

Модуль импортирует только то, что **строго ниже** по слоям. Импорты между слайсами одного слоя запрещены.

```text
_app ──► _pages ──► widgets ──► features ──► entities ──► shared
```

* ✅ `widgets/board-canvas` импортирует `features/add-sticky-note` и `entities/canvas-element`.
* ❌ `entities/board` импортирует `features/create-board`.
* ❌ `features/add-sticky-note` импортирует `features/export-board`. Общая логика выносится в `entities` или `shared`.

> ⚠️ Пока не проверяется автоматически — держится на ревью. Линтер [Steiger](https://github.com/feature-sliced/steiger)
> будет подключён отдельно.

## 4. Слайс и Public API

Каждый слайс отдаёт публичный интерфейс через корневой `index.ts`:

```text
features/add-sticky-note/
├── ui/              # AddStickyButton.tsx
├── model/           # use-add-sticky.ts
└── index.ts         # Public API
```

```ts
// features/add-sticky-note/index.ts
export { AddStickyButton } from "./ui/AddStickyButton";
export { useAddSticky } from "./model/use-add-sticky";
```

Импорт — только через Public API и только через алиас `@/` (других алиасов нет):

```tsx
// ❌ глубокий импорт во внутренности слайса
import { AddStickyButton } from "@/features/add-sticky-note/ui/AddStickyButton";

// ✅ через Public API
import { AddStickyButton } from "@/features/add-sticky-note";
```

Серверный код слайса экспортируется из отдельного `index.server.ts` — см. [nextjs.md](./nextjs.md).
