# 🎨 Стилизация и дизайн-система BoardFlow

> **Статус:** ✅ Соответствует коду (`@packages/tailwind-config`). Источник правды — `packages/tailwind-config/src/tokens.ts` и `theme.css`.

Основным инструментом стилизации в проекте является **Tailwind CSS**.  
Дизайн-токены, CSS-переменные темы (Light/Dark), палитра стикеров, типографика и скругления вынесены в общий пакет `@packages/tailwind-config`.

---

## 1. Бренд и типографика (Typography)

* **Название**: BoardFlow
* **Слоган**: "Think together. Build together."
* **Шрифты**:
  * **Headings (`font-heading`)**: `Plus Jakarta Sans` (Display/Hero 56–64px, H1 28–32px, H2 22–24px, H3 18–20px)
  * **Body (`font-sans`)**: `Inter` (Body 14–15px, Body Medium 14px, Caption 12–13px, Label 13px, Section Label 11px uppercase)
  * **Monospace (`font-mono`)**: `JetBrains Mono` (код, OTP, координаты 14px)

---

## 2. Цветовая палитра (Color Palette)

### Core (Основная)
| Токен | Hex | Назначение |
|---|---|---|
| `primary` | `#2563EB` | Основные кнопки, ссылки, фокус, активные состояния |
| `primary-hover` | `#1D4ED8` | Hover-состояния основных элементов |
| `primary-active` | `#1E40AF` | Нажатое/активное состояние |
| `primary-light` | `#DBEAFE` | Бейджи, мягкие фоны (blue-100) |
| `primary-subtle` | `#EFF6FF` | Выделенные строки, подсветка (blue-50) |

### Accent (Акценты)
| Токен | Hex | Назначение |
|---|---|---|
| `violet` | `#7C3AED` | AI-функции, спец-акцент |
| `violet-hover` | `#6D28D9` | Hover на AI-кнопках |
| `violet-light` | `#EDE9FE` | AI-бейджи, мягкие фоны |
| `amber` | `#F59E0B` | Предупреждения, хайлайты |
| `amber-light` | `#FEF3C7` | Желтые стикеры по умолчанию |
| `emerald` | `#10B981` | Успех, статус online, решено |
| `emerald-light` | `#D1FAE5` | Фоны успеха |
| `red` / `destructive` | `#EF4444` | Деструктивные действия, ошибки, offline |
| `red-hover` | `#DC2626` | Hover деструктивных кнопок |
| `red-light` | `#FEE2E2` | Фоны ошибок |

### Neutral (Нейтральные)
| Токен | Hex | Назначение |
|---|---|---|
| `text-primary` | `#0F172A` | Заголовки, жирный текст (slate-900) |
| `text-body` | `#334155` | Основной текст (slate-700) |
| `text-secondary` | `#64748B` | Второстепенный текст (slate-500) |
| `text-muted` | `#94A3B8` | Плейсхолдеры, подсказки, disabled (slate-400) |
| `text-faint` | `#CBD5E1` | Очень тонкий текст (slate-300) |
| `border` | `#E2E8F0` | Границы по умолчанию (slate-200) |
| `border-hover` | `#CBD5E1` | Границы при наведении (slate-300) |
| `bg-page` / `bg-background` | `#F8FAFC` | Фон страницы (slate-50) |
| `bg-card` | `#FFFFFF` | Карточки, модалки, панели |
| `bg-hover` | `#F1F5F9` | Hover фоны (slate-100) |
| `bg-overlay` | `rgba(0,0,0,0.50)` | Backdrop модальных окон |

---

## 3. Скругления (Radius) и тени (Shadows)

### Radius
* `rounded-sm`: 6px (бейджи, чипы)
* `rounded-DEFAULT` / `rounded-md`: 8px (кнопки, инпуты)
* `rounded-lg`: 12px (карточки, дропдауны)
* `rounded-xl`: 16px (модальные окна, плавающие панели)
* `rounded-full`: 9999px (аватары, пиллы, переключатели)

### Shadows
* `shadow-sm`: `0 1px 2px rgba(0,0,0,0.05)` (карточки в покое)
* `shadow-md`: `0 2px 8px rgba(0,0,0,0.06)` (карточки при hover)
* `shadow-lg`: `0 4px 16px rgba(0,0,0,0.08)` (модалки, плавающие панели)
* `shadow-xl`: `0 8px 32px rgba(0,0,0,0.12)` (контекстные меню, поповеры)
* `shadow-2xl`: `0 16px 48px rgba(0,0,0,0.16)` (дропдауны, тосты)

---

## 4. Токены холста и стикеров (Canvas & Sticky Notes)

| Элемент | Стилизация |
|---|---|
| Холст (`bg-canvas-bg`) | `#FAFBFC` с сеткой точек (`#E2E8F0`, шаг 24px) |
| Граница выделения | `2px dashed #2563EB` |
| AI preview | граница `2px dashed #7C3AED`, фон `rgba(124, 58, 237, 0.05)` |
| Граница группы | `1px dashed #93C5FD`, rounded-lg |

### Палитра стикеров
| Цвет | Фон (`bg-sticky-<color>`) | Граница при выделении |
|---|---|---|
| **Yellow** | `#FEF3C7` | `#F59E0B` |
| **Pink** | `#FCE7F3` | `#EC4899` |
| **Blue** | `#DBEAFE` | `#3B82F6` |
| **Green** | `#D1FAE5` | `#10B981` |
| **Violet** | `#EDE9FE` | `#8B5CF6` |
| **Orange** | `#FFEDD5` | `#F97316` |

---

## 5. Утилита `cn()` из `@packages/utils`

Для динамического и безопасного объединения классов Tailwind ВСЕГДА используйте утилиту `cn()`:

```tsx
import { cn } from "@packages/utils";

export function ToolButton({ className, isActive, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "p-2 rounded-md transition-colors duration-150 border border-transparent",
        "hover:bg-bg-hover text-text-secondary",
        isActive && "bg-primary text-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}
```
