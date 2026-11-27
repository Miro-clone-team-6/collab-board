import type { Preview } from "@storybook/react-vite";
import "@packages/ui/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      document.documentElement.classList.toggle("dark", globals.theme === "dark");
      return Story();
    },
  ],
  parameters: {
    backgrounds: { disable: true },
  },
};

export default preview;
