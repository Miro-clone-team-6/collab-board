# 🏛 Feature-Sliced Design (FSD) в CollabBoard

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Веб-приложение `apps/web` следует методологии архитектуры **Feature-Sliced Design (v2)**.  
Официальная документация FSD: [https://feature-sliced.design](https://feature-sliced.design)

---

> ⚠️ **Известная проблема:** Next.js считает `src/pages/*` маршрутами Pages Router, поэтому FSD-слой
> `pages` с ним конфликтует. Пока в `src/pages/` только `.gitkeep`. **Не создавать там файлы** до исправления
> (варианты: переименовать слой, например в `views/`, или вынести роуты в корневой `app/`).

## 1. Иерархия слоев

Слои строго упорядочены по уровню абстракции (сверху вниз):

```text
apps/web/src/
├── app/         # 1. Инициализация: роутинг Next.js, провайдеры, стили
├── pages/       # 2. Страницы: композиция виджетов в готовые экраны
├── widgets/     # 3. Виджеты: крупные самостоятельные UI-блоки (BoardCanvas, Toolbar, Header)
├── features/    # 4. Фичи: действия пользователя (AddStickyNote, ExportBoard, ZoomControls)
├── entities/    # 5. Сущности: доменные модели (Board, CanvasElement, User, Cursor)
└── shared/      # 6. Shared: утилиты, UI-примитивы, базовые хуки, конфиги
```

---

## 2. Матрица слоев и ответственности для CollabBoard

| Слой | Ответственность | Примеры в CollabBoard | Чего НЕ должно быть |
|---|---|---|---|
| **`app/`** | Роуты Next.js App Router, глобальные провайдеры, стили | `app/board/[id]/page.tsx`, `providers/QueryProvider.tsx` | Бизнес-логики холста |
| **`pages/`** | Композиция страницы из виджетов | `BoardWorkspacePage`, `DashboardPage` | Прямых сетевых вызовов `fetch` |
| **`widgets/`** | Крупные составные UI-блоки | `BoardCanvas` (холст), `BoardToolbar` (панель инструментов), `BoardHeader` | Дублирования логики фич |
| **`features/`** | Пользовательские интерактивные сценарии («Что делает?») | `add-sticky-note`, `export-board`, `invite-member`, `change-color` | Знания о других фичах |
| **`entities/`** | Бизнес-сущности («С чем работает?») | `board` (модель доски), `canvas-element` (фигура), `cursor` (курсор) | Интерактивных действий и форм |
| **`shared/`** | Переиспользуемый код вне домена | `shared/ui/button`, `shared/lib/canvas-math.ts` | Знания о Board или User |

---

## 3. Правило направления зависимостей

> **Главное правило:** Модуль может импортировать только то, что находится **строго ниже** него по слоям.  
> Импорты на одном слое (Cross-imports между слайсами) **запрещены**.

```text
app ──► pages ──► widgets ──► features ──► entities ──► shared
```

* ✅ `widgets/board-canvas` может импортировать `features/add-sticky-note` и `entities/canvas-element`.
* ❌ `entities/board` НЕ МОЖЕТ импортировать `features/create-board`.
* ❌ `features/add-sticky-note` НЕ МОЖЕТ напрямую импортировать `features/export-board`. Если есть общая логика, она выносится в `entities` или `shared`.

---

## 4. Структура слайса и Public API

Каждый слайс обязан предоставлять публичный интерфейс через корневой `index.ts`:

```text
features/add-sticky-note/
├── ui/              # Компоненты UI (AddStickyButton.tsx, StickyColorPicker.tsx)
├── model/           # Хуки, стейт, типы (use-add-sticky.ts)
└── index.ts         # Public API
```

### Пример Public API:
```ts
// features/add-sticky-note/index.ts
export { AddStickyButton } from "./ui/AddStickyButton";
export { useAddSticky } from "./model/use-add-sticky";
```

```tsx
// ❌ ЗАПРЕЩЕНО (глубокий импорт во внутренности слайса)
import { AddStickyButton } from "@/features/add-sticky-note/ui/AddStickyButton";

// ✅ РАЗРЕШЕНО (импорт через Public API)
import { AddStickyButton } from "@/features/add-sticky-note";
```
