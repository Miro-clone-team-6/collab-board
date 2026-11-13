# Стили

Стили пишутся классами [Tailwind 4](https://tailwindcss.com/docs). Подключение Tailwind
и тема (светлая и `.dark`) лежат в `packages/ui/src/styles/globals.css`; `apps/web`
импортирует его в `src/_app/styles/globals.css`.

## Правила

- Цвета задаются токенами темы: `bg-background`, `text-foreground`, `bg-primary`,
  `text-muted-foreground`, `border-border`. Не `#000` и не `bg-zinc-900`: такие цвета
  не меняются в тёмной теме.
- Новый цвет темы добавляется в `packages/ui/src/styles/globals.css` в трёх местах:
  переменная в `:root`, она же в `.dark` и строка `--color-<name>` в `@theme inline`.
  После этого появляются классы `bg-<name>`, `text-<name>` и другие.
- Классы с условиями или внешним `className` собираются через `cn` из `@packages/shared`:
  он убирает конфликтующие утилиты, и `className` снаружи перекрывает базовые классы.

  ```tsx
  className={cn("h-9 px-3", variant === "outline" && "border", className)}
  ```

- Отдельные `.css`-файлы для компонентов не пишутся: всё — классами Tailwind.
