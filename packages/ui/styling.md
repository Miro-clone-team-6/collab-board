## 🎨 Дизайн-токены и стилизация

> [!IMPORTANT]
> Все токены определены в `packages/ui/src/styles/globals.css` через `@theme inline`. 
> **Не создавайте** `tailwind.config.ts` — файл не используется.

### 📑 Содержание раздела

- [Цветовая палитра](#1-цветовая-палитра-color-palette)
- [Скругления](#2-скругления-radius)
- [Тени](#3-тени-shadows)
- [Холст и стикеры](#4-токены-холста-и-стикеров-canvas--sticky-notes)

---

### 1. Цветовая палитра (Color Palette)

#### 🔵 Core (Основная)

| Токен | Hex | Tailwind класс | Назначение |
|:------|:---:|:---------------|:-----------|
| `primary` | `#2563EB` | `bg-primary` | Основные кнопки, ссылки |
| `primary-hover` | `#1D4ED8` | `hover:bg-primary-hover` | Hover-состояния |
| `primary-active` | `#1E40AF` | `active:bg-primary-active` | Нажатое состояние |
| `primary-light` | `#DBEAFE` | `bg-primary-light` | Бейджи, мягкие фоны |
| `primary-subtle` | `#EFF6FF` | `bg-primary-subtle` | Выделенные строки |

#### 🟣 Accent (Акценты)

| Токен | Hex | Tailwind класс | Назначение |
|:------|:---:|:---------------|:-----------|
| `ai-accent` | `#8B5CF6` | `bg-ai-accent` | AI-функции (violet) |
| `ai-background` | `#F5F3FF` | `bg-ai-background` | AI-бейджи |
| `success` | `#10B981` | `bg-success` | Успех, онлайн (emerald) |
| `warning` | `#F59E0B` | `bg-warning` | Предупреждения (amber) |
| `destructive` | `#EF4444` | `bg-destructive` | Ошибки, удаление (red) |

#### ⚪ Neutral (Нейтральные)

| Токен | Hex | Tailwind класс | Назначение |
|:------|:---:|:---------------|:-----------|
| `text-primary` | `#0F172A` | `text-text-primary` | Заголовки (slate-900) |
| `text-secondary` | `#475569` | `text-text-secondary` | Основной текст |
| `text-muted` | `#94A3B8` | `text-text-muted` | Плейсхолдеры, disabled |
| `bg-page` | `#F8FAFC` | `bg-bg-page` | Фон страницы |
| `background` | `#FFFFFF` | `bg-background` | Карточки, модалки |

<details>
<summary><b>🌙 Тёмная тема (нажмите, чтобы увидеть значения)</b></summary>

| Токен | Светлая | Тёмная |
|:------|:-------:|:------:|
| `background` | `#FFFFFF` | `#0F172A` |
| `bg-page` | `#F8FAFC` | `#020617` |
| `text-primary` | `#0F172A` | `#F8FAFC` |
| `primary` | `#2563EB` | `#3B82F6` |

</details>

---

### 2. Скругления (Radius)

| Токен | Значение | Tailwind класс | Применение |
|:------|:--------:|:---------------|:-----------|
| `radius-sm` | ~4px | `rounded-sm` | Бейджи, чипы |
| `radius-md` | ~6px | `rounded-md` | Кнопки, инпуты |
| `radius-lg` | 8px | `rounded-lg` | Карточки |
| `radius-xl` | ~12px | `rounded-xl` | Модалки |
| — | 9999px | `rounded-full` | Аватары, пиллы |

---

### 3. Тени (Shadows)

> [!TIP]
> Tailwind v4 использует встроенные тени. Для кастомных значений добавьте в `@theme`.

| Уровень | Значение | Tailwind класс | Применение |
|:--------|:---------|:---------------|:-----------|
| `sm` | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Карточки в покое |
| `md` | `0 2px 8px rgba(0,0,0,0.06)` | `shadow-md` | Карточки при hover |
| `lg` | `0 4px 16px rgba(0,0,0,0.08)` | `shadow-lg` | Модалки |
| `xl` | `0 8px 32px rgba(0,0,0,0.12)` | `shadow-xl` | Поповеры |
| `2xl` | `0 16px 48px rgba(0,0,0,0.16)` | `shadow-2xl` | Дропдауны, тосты |

---

### 4. Токены холста и стикеров (Canvas & Sticky Notes)

#### 🎨 Палитра стикеров

<p align="center">
  <img src="docs/images/sticky-palette.png" width="600" alt="Sticky Notes Palette" />
</p>

| Цвет | Фон | Граница | Tailwind классы |
|:-----|:---:|:-------:|:----------------|
| 🟡 Yellow | `#FEF3C7` | `#F59E0B` | `bg-sticky-yellow` |
| 🩷 Pink | `#FCE7F3` | `#EC4899` | `bg-sticky-pink` |
| 🔵 Blue | `#DBEAFE` | `#3B82F6` | `bg-sticky-blue` |
| 🟢 Green | `#D1FAE5` | `#10B981` | `bg-sticky-green` |
| 🟣 Violet | `#EDE9FE` | `#8B5CF6` | `bg-sticky-violet` |
| 🟠 Orange | `#FFEDD5` | `#F97316` | `bg-sticky-orange` |

#### 🖼️ Холст (Canvas)

| Элемент | Стилизация | Tailwind классы |
|---------|-----------|-----------------|
| Фон | `#FAFBFC` + сетка `#E2E8F0` (24px) | `bg-canvas-bg` |
| Выделение | `2px dashed #2563EB` | `border-2 border-dashed border-primary` |
| AI preview | `2px dashed #7C3AED` + фон | `border-2 border-dashed border-ai-accent bg-ai-accent/5` |

---

### 💡 Примеры использования

**Кнопка:**
```tsx
<button className="bg-primary text-white hover:bg-primary-hover active:bg-primary-active rounded-md px-4 py-2 transition-fast">
  Создать доску
</button>