/**
 * Design System Tokens for CollabBoard
 */
export const colors = {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  // Canvas & Sticky note color palette
  canvas: {
    bg: "hsl(var(--canvas-bg, 0 0% 98%))",
    grid: "hsl(var(--canvas-grid, 0 0% 90%))",
  },
  sticky: {
    yellow: "#fef08a",
    green: "#bbf7d0",
    blue: "#bae6fd",
    pink: "#fbcfe8",
    purple: "#e9d5ff",
    orange: "#fed7aa",
  },
} as const;

export const radius = {
  sm: "calc(var(--radius) - 4px)",
  md: "calc(var(--radius) - 2px)",
  lg: "var(--radius)",
  full: "9999px",
} as const;

export type ThemeColors = typeof colors;
export type ThemeRadius = typeof radius;
