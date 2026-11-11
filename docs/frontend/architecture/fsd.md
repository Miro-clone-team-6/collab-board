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
| `src/_app/entrypoint/` | `AppProviders` (next-themes + TanStack Query), `QueryProvider` |
| `src/_app/styles/globals.css` | Тема из `@packages/tailwind-config` и директивы Tailwind |
| `src/_pages/home/` | `HomePage` — базовый пример страницы, см. ниже |
| `widgets/`, `features/`, `entities/`, `shared/*` | Пустые (`.gitkeep`) |

`HomePage` — заглушка: вся страница помечена `"use client"` и напрямую вызывает
`useHealthControllerCheck` из `@packages/api`. Оба момента противоречат правилам ниже и
[nextjs.md](./nextjs.md): `@packages/api` убирается ([ADR 0001](../../decisions/0001-api-contracts.md)),
а `"use client"` должен стоять на листовом компоненте. Не копировать как образец.

## 2. Ответственность слоёв

| Слой | Ответственность | Пример (условный) | Чего НЕ должно быть |
|---|---|---|---|
| **`_app/`** | Глобальные провайдеры, стили | `entrypoint/QueryProvider.tsx` | Роутов Next.js, бизнес-логики |
| **`_pages/`** | Композиция экрана из виджетов | `_pages/board-workspace` | Прямых сетевых вызовов |
| **`widgets/`** | Крупные составные UI-блоки | `board-canvas`, `board-toolbar` | Дублирования логики фич |
| **`features/`** | Действия пользователя («что делает?») | `add-sticky-note`, `export-board` | Знания о других фичах |
| **`entities/`** | Доменные сущности («с чем работает?») | `board`, `canvas-element`, `cursor` | Интерактивных действий и форм |
| **`shared/`** | Переиспользуемый код вне домена | `shared/ui/button`, `shared/lib/canvas-math` | Знания о Board или User |

## 3. Направление зависимостей

Модуль импортирует только то, что **строго ниже** по слоям. Импорты между слайсами одного слоя запрещены.

```text
_app ──► _pages ──► widgets ──► features ──► entities ──► shared
```

* ✅ `widgets/board-canvas` импортирует `features/add-sticky-note` и `entities/canvas-element`.
* ❌ `entities/board` импортирует `features/create-board`.
* ❌ `features/add-sticky-note` импортирует `features/export-board`. Общая логика выносится в `entities` или `shared`.

Проверяется Steiger (правило `fsd/forbidden-imports`) — см. [раздел 5](#5-проверка-steiger).

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

Импорт из другого слайса или слоя — только через Public API и только через алиас `@/` (других алиасов нет):

```tsx
// ❌ глубокий импорт во внутренности слайса
import { AddStickyButton } from "@/features/add-sticky-note/ui/AddStickyButton";

// ❌ относительный путь в другой слайс
import { Board } from "../../../entities/board";

// ✅ через Public API
import { AddStickyButton } from "@/features/add-sticky-note";
```

Внутри своего слайса — только относительные импорты:

```tsx
// features/add-sticky-note/ui/AddStickyButton.tsx
// ❌ абсолютный путь на свой же слайс
import { useAddSticky } from "@/features/add-sticky-note/model/use-add-sticky";

// ✅
import { useAddSticky } from "../model/use-add-sticky";
```

В слоях без слайсов (`shared`, `_app`) «своим слайсом» считается весь слой: `shared/ui` импортирует
`shared/lib` относительно (`../../lib/...`), а не через `@/shared/lib`.

Серверный код слайса экспортируется из отдельного `index.server.ts` — см. [nextjs.md](./nextjs.md).

Исключения — слои без слайсов:

- **`shared`** — public API не обязателен: `index.ts` заводится по необходимости, импорт по файлу
  разрешён.
- **`_app`** — импортируется только из роутера `app/`, напрямую: `@/_app/entrypoint/AppProviders`.

## 5. Проверка Steiger

Правила FSD проверяет [Steiger](https://github.com/feature-sliced/steiger) с плагином
`@feature-sliced/steiger-plugin` (версии зафиксированы точно в `apps/web/package.json`).
Biome правила FSD не проверяет: инструменты независимы, каждый со своим конфигом.

| Команда | Что делает |
|---|---|
| `pnpm lint` | Biome, затем Steiger. Входит в проверку перед завершением задачи |
| `pnpm lint:fsd` | Только Steiger (через turbo, с кэшем) |
| `pnpm --filter web lint:fsd` | `steiger ./src` без turbo |

### Конфиг

[`apps/web/steiger.config.ts`](../../../apps/web/steiger.config.ts) — пресет `recommended` с отступлениями:

| Отступление | Почему |
|---|---|
| `ignores: ["**/.gitkeep"]` | Пустые сегменты с заглушкой ловятся как «missing a public API» |
| `fsd/public-api` и `fsd/no-public-api-sidestep` выключены для `src/shared/**` | В shared public API не обязателен — см. [раздел 4](#4-слайс-и-public-api). Первое правило требует `index.ts` на сегмент, второе запрещает импорт по файлу. Для слайсов оба действуют |
| `fsd/import-locality` включено (в пресете выключено) | Правило из [раздела 4](#4-слайс-и-public-api): внутри слайса относительные импорты, между слайсами — `@/` |
| `fsd/insignificant-slice` — `warn` | На старте новый слайс обычно используется в одном месте. Предупреждение видно в выводе, но `pnpm lint` и коммит не падают |
| `fsd/typo-in-layer-name` выключено | Считает `_app` и `_pages` опечатками. Исправлено в апстриме ([#282](https://github.com/feature-sliced/steiger/issues/282)), не в релизе. Включить после обновления плагина > 0.8.2 |

### Что не проверяется

- Роутер `apps/web/app/` — не слой FSD, Steiger анализирует только `src/`.

### Что учесть

- `fsd/insignificant-slice` (`warn`): слайс, который используют ноль или один других слайсов, — повод
  подумать, не перенести ли код туда, где он используется («Consider removing / merging»).
  На страницы `_pages` правило не действует: их импортирует роутер `app/`, который Steiger не видит.
- Предупреждения не роняют проверку: Steiger запускается без `--fail-on-warnings`.

### Где запускается

- **turbo:** задача `lint:fsd`, кэш по `src/**`, `steiger.config.ts`, `tsconfig.json`, `tsconfig.base.json`.
  `tsconfig` во входах, потому что Steiger берёт из него алиас `@/` для разрешения импортов.
- **pre-commit:** если в коммите есть файлы из `apps/web/src/**` или `steiger.config.ts`, lint-staged
  один раз запускает `pnpm lint:fsd` на весь `src` — правилам о связях между слайсами нужен весь проект,
  поэтому список файлов не передаётся.
- **lint-staged идёт последовательно** (`--concurrent false` в `.husky/pre-commit`): иначе Biome с `--write`
  переписывает файлы, пока Steiger их читает.
- **Steiger проверяет файлы на диске, а не индекс.** lint-staged прячет только неиндексированные правки
  в частично добавленных файлах. Изменённые, но не добавленные файлы и новые файлы остаются на диске —
  Steiger видит их. Нарушение в черновике, которого нет в коммите, уронит коммит; и наоборот, черновик
  может «починить» то, что сломано в коммите.
