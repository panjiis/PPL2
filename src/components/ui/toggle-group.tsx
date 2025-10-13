"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Toggle } from "@/components/ui/toggle";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

// 1. Define the Context
// This will share state and functionality from the parent to children.
interface ToggleGroupContextType extends VariantProps<typeof buttonVariants> {
  type: "single" | "multiple";
  value: string | string[];
  onValueChange: (itemValue: string) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextType | null>(
  null
);

// Custom hook for easy context consumption
const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup");
  }
  return context;
};

// 2. The Parent ToggleGroup Component
interface ToggleGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      className,
      variant,
      size,
      type = "single",
      value,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const handleToggle = (itemValue: string) => {
      if (!onValueChange) return;

      if (type === "single") {
        onValueChange(itemValue === value ? "" : itemValue);
      } else {
        const arr = Array.isArray(value) ? [...value] : [];
        const newValue = arr.includes(itemValue)
          ? arr.filter((v) => v !== itemValue)
          : [...arr, itemValue];
        onValueChange(newValue);
      }
    };

    return (
      <ToggleGroupContext.Provider
        value={{ type, value: value || (type === 'multiple' ? [] : ''), onValueChange: handleToggle, variant, size }}
      >
        <div
          ref={ref}
          role={type === "single" ? "radiogroup" : "group"}
          className={cn("inline-flex items-stretch", className)}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);
ToggleGroup.displayName = "ToggleGroup";

interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  value: string;
}

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof Toggle>,
  ToggleGroupItemProps
>(({ className, value, children, ...props }, ref) => {
  const {
    value: groupValue,
    onValueChange,
    type,
    variant,
    size,
  } = useToggleGroup();

  const isPressed =
    type === "single"
      ? groupValue === value
      : Array.isArray(groupValue) && groupValue.includes(value);

  return (
    <Toggle
      ref={ref}
      pressed={isPressed}
      variant={variant || "outline"}
      size={size || "default"}
      onClick={() => onValueChange(value)}
      className={cn(
        "rounded-none border-y border-l border-[hsl(var(--border))] first:rounded-l-md first:border-l last:rounded-r-md last:border-r -ml-px first:ml-0",
        className
      )}
      {...props}
    >
      {children}
    </Toggle>
  );
});
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };