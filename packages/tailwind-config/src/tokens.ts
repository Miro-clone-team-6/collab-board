/**
 * BoardFlow Design System Tokens
 */

export const colors = {
  // Semantic Theme Colors (support Light & Dark via CSS variables)
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
    DEFAULT: "#2563EB",
    hover: "#1D4ED8",
    active: "#1E40AF",
    light: "#DBEAFE",
    subtle: "#EFF6FF",
    foreground: "#FFFFFF",
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
    DEFAULT: "#EF4444",
    hover: "#DC2626",
    active: "#B91C1C",
    light: "#FEE2E2",
    foreground: "#FFFFFF",
  },
  border: {
    DEFAULT: "#E2E8F0",
    hover: "#CBD5E1",
  },
  input: "hsl(var(--input))",
  ring: "#2563EB",

  // Core Palette
  core: {
    primary: "#2563EB",
    "primary-hover": "#1D4ED8",
    "primary-active": "#1E40AF",
    "primary-light": "#DBEAFE",
    "primary-subtle": "#EFF6FF",
  },

  // Accent Palette
  violet: {
    DEFAULT: "#7C3AED",
    hover: "#6D28D9",
    light: "#EDE9FE",
  },
  amber: {
    DEFAULT: "#F59E0B",
    light: "#FEF3C7",
  },
  emerald: {
    DEFAULT: "#10B981",
    light: "#D1FAE5",
  },
  red: {
    DEFAULT: "#EF4444",
    hover: "#DC2626",
    light: "#FEE2E2",
  },

  // Neutral Palette
  text: {
    primary: "#0F172A",
    body: "#334155",
    secondary: "#64748B",
    muted: "#94A3B8",
    faint: "#CBD5E1",
  },
  bg: {
    page: "#F8FAFC",
    card: "#FFFFFF",
    hover: "#F1F5F9",
    subtle: "#F8FAFC",
    overlay: "rgba(0, 0, 0, 0.50)",
  },

  // Canvas & Board Tokens
  canvas: {
    bg: "#FAFBFC",
    grid: "#E2E8F0",
    selection: "#2563EB",
    "ai-border": "#7C3AED",
    "ai-bg": "rgba(124, 58, 237, 0.05)",
    "group-boundary": "#93C5FD",
  },

  // Sticky Notes Palette
  sticky: {
    yellow: {
      DEFAULT: "#FEF3C7",
      border: "#F59E0B",
    },
    pink: {
      DEFAULT: "#FCE7F3",
      border: "#EC4899",
    },
    blue: {
      DEFAULT: "#DBEAFE",
      border: "#3B82F6",
    },
    green: {
      DEFAULT: "#D1FAE5",
      border: "#10B981",
    },
    violet: {
      DEFAULT: "#EDE9FE",
      border: "#8B5CF6",
    },
    orange: {
      DEFAULT: "#FFEDD5",
      border: "#F97316",
    },
  },
} as const;

export const radius = {
  sm: "6px",
  DEFAULT: "8px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
  md: "0 2px 8px rgba(0, 0, 0, 0.06)",
  lg: "0 4px 16px rgba(0, 0, 0, 0.08)",
  xl: "0 8px 32px rgba(0, 0, 0, 0.12)",
  "2xl": "0 16px 48px rgba(0, 0, 0, 0.16)",
} as const;

export const fontFamily: Record<string, string[]> = {
  sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
  heading: ["var(--font-plus-jakarta-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
  mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
};

export const fontSize: Record<
  string,
  [string, { lineHeight: string; fontWeight?: string; letterSpacing?: string }]
> = {
  display: ["3.75rem", { lineHeight: "1.1", fontWeight: "700" }],
  h1: ["2rem", { lineHeight: "1.2", fontWeight: "700" }],
  h2: ["1.5rem", { lineHeight: "1.25", fontWeight: "700" }],
  h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
  body: ["0.9375rem", { lineHeight: "1.5", fontWeight: "400" }],
  "body-md": ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],
  caption: ["0.8125rem", { lineHeight: "1.4", fontWeight: "400" }],
  label: ["0.8125rem", { lineHeight: "1.0", fontWeight: "500" }],
  "section-label": ["0.6875rem", { lineHeight: "1.0", letterSpacing: "0.05em", fontWeight: "600" }],
  code: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
};

export const transitionDuration = {
  "100": "100ms",
  "150": "150ms",
  "200": "200ms",
  "300": "300ms",
  "1500": "1500ms",
} as const;

export type ThemeColors = typeof colors;
export type ThemeRadius = typeof radius;
export type ThemeShadows = typeof shadows;
export type ThemeFontFamily = typeof fontFamily;
export type ThemeFontSize = typeof fontSize;
export type ThemeTransitionDuration = typeof transitionDuration;
