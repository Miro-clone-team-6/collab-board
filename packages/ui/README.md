# @packages/ui — UI-кит CollabBoard

Библиотека переиспользуемых UI-компонентов для монорепозитория CollabBoard. Построена на базе shadcn/ui, Tailwind CSS v4 и Storybook.

## 🛠 Технологический стек

- **Фреймворк**: React 19 + TypeScript (Strict mode)
- **Стилизация**: Tailwind CSS v4 (CSS-first конфигурация, файла `tailwind.config.ts` нет)
- **Компоненты**: Примитивы Radix UI + архитектура shadcn/ui
- **Документация**: Storybook 8.4.7 + Webpack 5 builder
- **Линтинг/Форматирование**: Biome (с pre-commit хуками Husky)
- **Шрифты**: Inter (основной текст), Plus Jakarta Sans (заголовки), JetBrains Mono (код)

---

## 📂 Структура монорепозитория

```text
collab-board/
├── apps/
│   └── web/                 # Next.js приложение + Storybook
│       ├── .storybook/      # Конфиг Storybook (main.ts, preview.ts)
│       ├── app/             # Роуты Next.js (App Router)
│       ├── postcss.config.mjs
│       └── package.json
├── packages/
│   └── ui/                  # @packages/ui — общая библиотека компонентов
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/      # Базовые компоненты shadcn (Button, Input, Dialog...)
│       │   │   └── layout/  # Составные компоненты (Sidebar, Navbar)
│       │   ├── lib/utils.ts # Утилита cn() (clsx + tailwind-merge)
│       │   └── styles/globals.css  # Токены темы Tailwind v4
│       ├── postcss.config.mjs
│       └── package.json
├── package.json             # Корневой package.json с pnpm overrides
└── pnpm-workspace.yaml


## 🚀 Начало работы

### Требования
Убедитесь, что у вас установлены Node.js (v18+) и `pnpm`.

### Установка зависимостей
Из **корня** монорепозитория установите зависимости:
```bash
pnpm install

### Запуск Storybook 

# Из корня монорепозитория
pnpm --filter web storybook

# Или перейдите в apps/web
cd apps/web
pnpm run storybook

Storybook будет доступен по адресу http://localhost:6006.