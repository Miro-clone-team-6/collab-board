import { colors, radius } from "@packages/tailwind-config";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors,
      borderRadius: radius,
    },
  },
  plugins: [],
};

export default config;
