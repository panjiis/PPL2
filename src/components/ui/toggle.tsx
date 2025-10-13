"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  pressed?: boolean;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant = "default", size, pressed = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? "on" : "off"}
        className={cn(
          buttonVariants({ variant, size, className }),
          "relative overflow-hidden transition-colors",
          // overlay using ::after with opacity, works on any variant
          "after:pointer-events-none after:absolute after:inset-0 after:bg-[hsl(var(--foreground))] after:opacity-0",
          "data-[state=on]:after:opacity-10"
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };
