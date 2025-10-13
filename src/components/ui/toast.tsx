import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const toastVariants = cva(
  "relative w-full rounded-lg border border-[hsl(var(--border))] p-4 flex items-start gap-4 backdrop-blur-xl",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
        success: "bg-[hsl(var(--success-background))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success-background))]/90",
        warning: "bg-[hsl(var(--warning-background))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning-background))]/90",
        danger: "bg-[hsl(var(--danger-background))] text-[hsl(var(--danger-foreground))] hover:bg-[hsl(var(--danger-background))]/90",
        info: "bg-[hsl(var(--info-background))] text-[hsl(var(--info-foreground))] hover:bg-[hsl(var(--info-background))]/90"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TOAST_ICONS: Record<"success" | "warning" | "danger" | "info", React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <XCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof toastVariants> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      className,
      variant = "default",
      title,
      description,
      icon,
      onClose,
      ...props
    },
    ref
  ) => {
    const finalIcon = icon ?? (variant && variant !== "default" ? TOAST_ICONS[variant] : null);

    return (
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -40, scale: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div
          ref={ref}
          className={cn(toastVariants({ variant, className }))}
          role="alert"
          {...props}
        >
          {finalIcon && <div className="flex-shrink-0">{finalIcon}</div>}
          <div className="flex-grow grid gap-1">
            <div className="font-semibold">{title}</div>
            {description && (
              <div className="text-sm">{description}</div>
            )}
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              className="absolute top-2 right-2"
              aria-label="Close"
              variant={"ghost"} 
              size={"icon"}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
);

Toast.displayName = "Toast";

export { Toast };