# 🎨 Стилизация и Tailwind CSS

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Основным инструментом стилизации в проекте является **Tailwind CSS**.  
Дизайн-токены, CSS-переменные тем и палитра стикеров вынесены в общий пакет `@packages/tailwind-config`.

---

## 1. Организация стилей

Tailwind CSS 4, подключён через `@tailwindcss/postcss` (`apps/web/postcss.config.mjs`). `tailwind.config.*` нет:
вся настройка — в CSS.

* **`@packages/tailwind-config/theme.css`** (пакет только из CSS):
  - CSS-переменные темы (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--radius`, `--canvas-*`)
    в `:root` и `.dark`. Значения — полные цвета (`hsl(...)`), поэтому модификаторы прозрачности (`bg-primary/50`) работают.
  - `@theme inline` превращает их в утилиты (`bg-background`, `text-muted-foreground`, `rounded-lg`…).
    `inline` нужен, чтобы утилиты ссылались на переменную, а не на её значение, и `.dark` их переопределял.
  - `@theme` с цветами стикеров — от темы не зависят.
  - `@custom-variant dark`: `dark:` срабатывает по классу `.dark`, который ставит `next-themes` (`attribute="class"`).
  - Совместимость с v3 в `@layer base`: цвет границы по умолчанию — `--color-border` (в v4 — `currentColor`),
    `cursor: pointer` у кнопок.
* **`@packages/ui/styles.css`**: `@source "./"` — регистрирует компоненты UI-кита для поиска классов.
  Tailwind 4 сам ищет классы только внутри `apps/web` и пропускает `node_modules`, через который подключён пакет.
  Путь в `@source` считается от CSS-файла, имя пакета там не работает — поэтому директива лежит в самом пакете.
* **`apps/web/src/_app/styles/globals.css`**: `@import "tailwindcss"`, тема, `@packages/ui/styles.css`.
* Biome разбирает директивы Tailwind (`css.parser.tailwindDirectives` в `biome.json`).
* VS Code: `.vscode/settings.json` открывает `*.css` в режиме `tailwindcss` (без предупреждений `unknownAtRules`)
  и включает подсказки классов внутри `cn(...)`; `.vscode/extensions.json` рекомендует Tailwind CSS IntelliSense и Biome.

---

## 2. Палитра стикеров и холста (Miro Tokens)

В проекте настроены специальные семантические цвета для интерактивной доски:

| Класс Tailwind | Назначение |
|---|---|
| `bg-canvas-bg` | Фоновый цвет бесконечного холста |
| `text-canvas-grid` | Цвет точек координатной сетки холста |
| `bg-sticky-yellow` | Классический желтый стикер |
| `bg-sticky-green` | Зеленый стикер (Done / Успех) |
| `bg-sticky-blue` | Синий стикер (Инфо / Архитектура) |
| `bg-sticky-pink` | Розовый стикер (Внимание / Баг) |
| `bg-sticky-purple` | Фиолетовый стикер |
| `bg-sticky-orange` | Оранжевый стикер |

### Пример стилизованного стикера:
```tsx
export function StickyCard({ title, color = "yellow" }: { title: string; color?: string }) {
  const colorClass = {
    yellow: "bg-sticky-yellow text-amber-950 border-amber-300",
    green: "bg-sticky-green text-emerald-950 border-emerald-300",
    blue: "bg-sticky-blue text-sky-950 border-sky-300",
  }[color] || "bg-sticky-yellow text-amber-950 border-amber-300";

  return (
    <div className={`p-4 rounded-lg shadow-md border ${colorClass} font-sans`}>
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}
```

---

## 3. Функция `cn()` из `@packages/shared`

Для динамического и безопасного объединения классов Tailwind ВСЕГДА используйте утилиту `cn()`:

```tsx
import { cn } from "@packages/shared";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export function ToolButton({ className, isActive, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "p-2 rounded-lg transition-colors border border-transparent",
        "hover:bg-muted text-muted-foreground",
        isActive && "bg-primary text-primary-foreground border-primary shadow-sm",
        className
      )}
      {...props}
    />
  );
}
```

---

## 4. Правила написания стилей

1. ❌ **Никаких инлайновых стилей (`style={{ ... }}`):** за исключением динамических координат зума и панорамирования холста (`transform: translate(...) scale(...)`).
2. ❌ **Никаких кастомных `.css` файлов для каждого компонента:** используйте Tailwind классы.
3. ✅ **Используйте семантические токены темы:** вместо жестких `#000000` или `bg-blue-500` используйте `bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `border-border`. Это гарантирует корректную работу ночной темы.
