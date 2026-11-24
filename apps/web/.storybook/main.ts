import { dirname, resolve } from "node:path";
import type { StorybookConfig } from "@storybook/react-webpack5";

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(`${value}/package.json`));
}

const config: StorybookConfig = {
  stories: ["../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    getAbsolutePath("@storybook/addon-webpack5-compiler-swc"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {},
  },
  webpackFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias as Record<string, string>),
      "@": resolve(__dirname, "../../../packages/ui/src"),
    };

    config.module = config.module || { rules: [] };

    // Удаляем стандартное правило Storybook для CSS
    config.module.rules = (config.module.rules || []).filter((rule) => {
      if (!rule || typeof rule === "string") return true;
      const test = (rule as { test?: RegExp | string }).test;
      return !(test instanceof RegExp && test.source.includes("\\.css"));
    });

    // Добавляем своё правило (совместимое с postcss-loader v8)
    config.module.rules.push({
      test: /\.css$/,
      use: [
        require.resolve("style-loader"),
        {
          loader: require.resolve("css-loader"),
          options: { importLoaders: 1 },
        },
        {
          loader: require.resolve("postcss-loader"),
          options: {
            postcssOptions: {
              plugins: [["@tailwindcss/postcss", {}]],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default config;
