/**
 * Общий PostCSS-конфиг приложений. Приложение реэкспортирует его в своём postcss.config.mjs
 * и само ставит @tailwindcss/postcss: Next ищет плагины в зависимостях приложения.
 * @type {import('postcss-load-config').Config}
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
