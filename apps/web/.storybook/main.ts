import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, resolve } from "path";

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(`${value}/package.json`));
}

const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          "@": resolve(__dirname, "../../../packages/ui/src"),
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        // 👇 КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: Исключаем ВСЁ, что вызывает конфликт pre-bundling
        exclude: [
          "@storybook/react",
          "@storybook/react-vite",
          "@storybook/addon-essentials",
          "@storybook/addon-interactions",
          "@storybook/addon-docs", // <-- ИМЕННО ЭТОТ ПАКЕТ ВЫЗЫВАЕТ ОШИБКУ jsdoc-type-pratt-parser
          "jsdoc-type-pratt-parser",
        ],
      },
    };
  },
};

export default config;
