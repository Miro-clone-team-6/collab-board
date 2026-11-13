import type { VariantProps } from "@packages/utils";
import type { HTMLAttributes } from "react";
import type { testVariants } from "./constants";

export interface TestProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof testVariants> {}
