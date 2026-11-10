# 🌐 Документация Frontend (`apps/web`)

Добро пожаловать в техническую документацию клиентской части CollabBoard!  
Здесь собраны правила, стандарты, архитектурные решения и регламенты работы с кодом фронтенда.

---

## ⚡ Шпаргалка: Куда положить код? (Decision Tree)

```text
Какой тип кода вы создаете?
├── Базовый UI элемент (Кнопка, Модалка, Инпут, Дропдаун, Бейдж)?
│   ├── Общий для нескольких экранов? ──► packages/ui
│   └── Специфичен строго для одной страницы? ──► apps/web/src/shared/ui/
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
│   ├── Файловый роут App Router ──► apps/web/src/app/(routes)/...
│   └── Композиция экрана ──► apps/web/src/pages/<page-name>/
│
└── Общая утилита, хук или клиент без бизнес-логики?
    └── apps/web/src/shared/(lib|hooks|types|config)
```

---

## 📁 Структура разделов документации

### 1. Архитектура и каркас приложения
* [**Feature-Sliced Design (FSD)**](./architecture/fsd.md) — слои архитектуры, иерархия абстракций, правила импортов и Public API.
* [**Next.js 15 App Router & React 19**](./architecture/nextjs.md) — тонкие роуты, Server vs Client Components, rewrites к API.

### 2. Данные и состояние
* [**API Contracts, Swagger & Orval**](./data/api-contracts.md) — контракт-ферст подход, автогенерация хуков TanStack Query, транспорт.
* [**TanStack Query (Server State)**](./data/tanstack-query.md) — настройка провайдера, фабрики ключей, инвалидация кэша.
* [**State Management: Canvas (Zustand) vs Server State**](./data/state-management.md) — почему стейт холста живет в Zustand, а данные в React Query.

### 3. UI и Дизайн-система
* [**Стилизация и Tailwind CSS**](./ui/styling.md) — токены темы, палитра стикеров Miro, утилита `cn()`.
* [**UI Kit & Примитивы**](./ui/ui-kit.md) — компоненты на базе Radix UI, ленивая загрузка диалогов.

### 4. Разработка и сборка
* [**Сборка и команды (Build & Tooling)**](./development/build.md) — скрипты pnpm, фильтры воркспейсов, граф Turborepo.
