export default {
  "**/*.{js,jsx,ts,tsx,json,css,mjs}": ["biome check --write --no-errors-on-unmatched"],
  // Steiger проверяет весь src целиком (связи между слайсами), поэтому список файлов не передаём.
  "apps/web/{src/**,steiger.config.ts}": () => "pnpm lint:fsd",
  // Ссылки могут сломаться в файлах вне коммита (переименование, удаление), поэтому проверяем все.
  "**/*.md": () => "pnpm lint:docs",
};
