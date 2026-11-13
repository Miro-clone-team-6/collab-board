import { cn } from "@packages/utils";
import { forwardRef } from "react";
import { testVariants } from "./constants";
import type { TestProps } from "./types";

export const Test = forwardRef<HTMLDivElement, TestProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="test"
        className={cn(testVariants({ variant, className }))}
        {...props}
      >
        {children ?? "Test Component"}
      </div>
    );
  },
);

Test.displayName = "Test";
