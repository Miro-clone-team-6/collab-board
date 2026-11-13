import {
  colors,
  fontFamily,
  fontSize,
  radius,
  shadows,
  transitionDuration,
} from "@packages/tailwind-config";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/ui/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      colors,
      borderRadius: radius,
      boxShadow: shadows,
      fontFamily,
      fontSize,
      transitionDuration,
    },
  },
  plugins: [],
};

export default config;
