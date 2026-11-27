import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../../../packages/ui/src/ui/**/*.stories.tsx"],
  viteFinal: (config) =>
    mergeConfig(config, {
      optimizeDeps: {
        // Vite не преобразует CommonJS из связанных workspace-пакетов автоматически.
        include: ["@packages/ui > @packages/shared"],
      },
    }),
};

export default config;
