# 🌐 Документация Frontend (`apps/web`)

> **Статус:** 🚧 На пересмотре. Сверены с кодом (✅): [fsd.md](./architecture/fsd.md), [nextjs.md](./architecture/nextjs.md).
> Остальные разделы могут описывать то, чего нет в коде; источник правды — код и [architecture.md](../architecture.md).

---

## ⚡ Шпаргалка: Куда положить код? (Decision Tree)

```text
Какой тип кода вы создаете?
├── Базовый UI элемент (Кнопка, Модалка, Инпут, Дропдаун, Бейдж)?
│   ├── Нужен нескольким приложениям? ──► packages/ui
│   ├── Нужен разным экранам apps/web? ──► apps/web/src/shared/ui/
│   └── Нужен одному экрану? ──► ui/ внутри его слайса 
│
├── Доменная сущность (Доска, Фигура холста, Пользователь, Курсор)?
│   └── apps/web/src/entities/<entity-name>/
│
├── Интерактивное действие пользователя (Создать стикер, Изменить цвет, Экспорт PNG)?
│   └── apps/web/src/features/<feature-name>/
│
├── Крупный составной блок экрана (Бесконечный холст, Панель инструментов, Шапка доски)?
│   └── apps/web/src/widgets/<widget-name>/
│
├── Маршрут / Страница?
│   ├── Файловый роут App Router ──► apps/web/app/... (тонкий реэкспорт)
│   └── Композиция экрана ──► apps/web/src/_pages/<page-name>/
│
└── Общая утилита, хук, конфиг или клиент API без бизнес-логики?
    └── apps/web/src/shared/(lib|config|api)
```

---

## 📁 Структура разделов документации

### 1. Архитектура и каркас приложения

* **[Feature-Sliced Design (FSD)](./architecture/fsd.md)** — слои архитектуры, иерархия абстракций, правила импортов и Public API.
* **[Next.js 15 App Router & React 19](./architecture/nextjs.md)** — тонкие роуты, Server vs Client Components, rewrites к API.

### 2. Данные и состояние

* **[TanStack Query (Server State)](./data/tanstack-query.md)** — настройка провайдера, фабрики ключей, инвалидация кэша.
* Состояние на клиенте (Query / Zustand / React Hook Form) — решение не принято.

### 3. UI и Дизайн-система

* **[Стилизация и Tailwind CSS](./ui/styling.md)** — токены темы, палитра стикеров Miro, утилита `cn()`.
* **[UI Kit & Примитивы](./ui/ui-kit.md)** — компоненты на базе Radix UI, ленивая загрузка диалогов.

### 4. Разработка и сборка

* **[Сборка и команды (Build & Tooling)](./development/build.md)** — скрипты pnpm, фильтры воркспейсов, граф Turborepo.
