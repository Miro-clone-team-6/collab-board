# FSD в `apps/web`

`apps/web/src` организован по [Feature-Sliced Design](https://feature-sliced.design/docs)
и [гайду FSD для Next.js](https://feature-sliced.design/docs/guides/tech/with-nextjs).
Слои, слайсы и public API — в документации FSD; здесь только то, чем проект от неё отличается.

## Договорённости

- Слои `app` и `pages` называются `_app` и `_pages`, чтобы Next не принял их за свои роутеры.
  Как они связаны с `app/` — в [Next.js](nextjs.md).
- Внутри слайса импорты относительные, между слайсами и слоями — только через алиас `@/`
  и `index.ts` слайса:

  ```tsx
  import { BoardCard } from "@/entities/board"; // другой слайс
  import { useIsMounted } from "../lib/use-is-mounted"; // свой слайс
  ```

- В `shared` `index.ts` заводится по необходимости, импорт по файлу разрешён:
  `@/shared/lib/date/format-date`.

## Проверка

[Steiger](https://github.com/feature-sliced/steiger) проверяет правила FSD в `apps/web/src`;
роутер `app/` он не проверяет. Конфиг — `apps/web/steiger.config.ts`, отступления от пресета
пояснены комментариями в нём. Steiger входит в `pnpm lint` и в pre-commit; отдельно:

```bash
pnpm lint:fsd
```

- Предупреждение `fsd/insignificant-slice`: слайс используется в одном месте или нигде.
  Повод перенести код туда, где он нужен; коммит не блокирует.
- В pre-commit Steiger читает файлы на диске, а не индекс. Нарушение в незакоммиченном
  черновике тоже уронит коммит.
