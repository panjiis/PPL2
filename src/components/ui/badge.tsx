import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border border-[hsl(var(--border))] px-2 py-1 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/80",
        secondary:
          "border-transparent bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/80",
        destructive:
          "border-transparent bg-[hsl(var(--danger-background))] text-[hsl(var(--danger-foreground))] hover:bg-[hsl(var(--danger-background))]/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
}

function Badge({ className, variant, icon, iconPosition = "start", ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon && iconPosition === "start" && (
        <span className="mr-1 flex-shrink-0">{icon}</span>
      )}
      {props.children}
      {icon && iconPosition === "end" && (
        <span className="ml-1 flex-shrink-0">{icon}</span>
      )}
    </div>
  );
}

export { Badge, badgeVariants };