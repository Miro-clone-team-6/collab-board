import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Заглушки пустых папок — не код.
    ignores: ["**/.gitkeep"],
  },
  {
    // В shared public API не обязателен: index.ts заводится по необходимости, импорт по файлу разрешён.
    files: ["./src/shared/**"],
    rules: {
      "fsd/public-api": "off",
      "fsd/no-public-api-sidestep": "off",
    },
  },
  {
    rules: {
      // Внутри слайса — только относительные импорты, между слайсами и слоями — только через `@/`.
      "fsd/import-locality": "error",
      // На старте новый слайс почти всегда используется в одном месте — подсказка, а не блокер.
      "fsd/insignificant-slice": "warn",
      // Ложно считает `_app` и `_pages` опечатками. Исправлено в апстриме, но ещё не в релизе:
      // https://github.com/feature-sliced/steiger/issues/282 — включить после обновления плагина (> 0.8.2).
      "fsd/typo-in-layer-name": "off",
    },
  },
]);
