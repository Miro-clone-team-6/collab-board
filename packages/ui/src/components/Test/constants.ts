import { cva } from "@packages/utils";

export const testVariants = cva(
  "inline-flex items-center justify-center rounded px-3 py-1 text-sm font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white",
        outline: "border border-slate-300 text-slate-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
