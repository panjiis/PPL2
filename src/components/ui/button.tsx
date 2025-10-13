import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-[hsl(var(--background))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90",
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80",
        outline: "border border-[hsl(var(--input))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        ghost: "hover:bg-[hsl(var(--foreground))]/5",
        link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-[hsl(var(--success-background))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success-background))]/90",
        warning: "bg-[hsl(var(--warning-background))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning-background))]/90",
        danger: "bg-[hsl(var(--danger-background))] text-[hsl(var(--danger-foreground))] hover:bg-[hsl(var(--danger-background))]/90",
        info: "bg-[hsl(var(--info-background))] text-[hsl(var(--info-foreground))] hover:bg-[hsl(var(--info-background))]/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-fit aspect-square p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };