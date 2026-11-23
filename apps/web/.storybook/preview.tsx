import type { Decorator, Preview } from "@storybook/react";

import "@packages/ui/globals.css";

const withTheme: Decorator = (Story) => (
  <div className="min-h-screen bg-background text-foreground p-8 font-sans antialiased">
    <Story />
  </div>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
