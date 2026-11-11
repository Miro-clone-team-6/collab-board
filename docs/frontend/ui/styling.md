# 🎨 Стилизация и Tailwind CSS

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Основным инструментом стилизации в проекте является **Tailwind CSS**.  
Дизайн-токены, CSS-переменные тем и палитра стикеров вынесены в общий пакет `@packages/tailwind-config`.

---

## 1. Организация стилей

* **`@packages/tailwind-config`**:
  - `src/theme.css`: глобальные CSS-переменные темы (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--radius`). Поддерживает светлую и тёмную тему (`.dark`).
  - `src/tokens.ts`: специфичные для CollabBoard токены (холст, сетка, стикеры).
* **`apps/web/src/_app/globals.css`**: импортирует тему из `@packages/tailwind-config/theme.css` и директивы `@tailwind`.
* **`apps/web/tailwind.config.ts`**: подключает пресет из `@packages/tailwind-config`.

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

## 3. Функция `cn()` из `@packages/utils`

Для динамического и безопасного объединения классов Tailwind ВСЕГДА используйте утилиту `cn()`:

```tsx
import { cn } from "@packages/utils";

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
