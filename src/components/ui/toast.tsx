import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
// MODIFIED: Import useAnimation
import { motion, useAnimation } from "framer-motion"; 
import type { ToastPosition } from "@/components/ui/toaster";

const toastVariants = cva(
  "relative w-full rounded-lg border border-[hsl(var(--border))] p-4 flex items-start gap-4 backdrop-blur-xl overflow-x-hidden",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--background))] text-[hsl(var(--foreground))]",
        success:
          "bg-[hsl(var(--success-background))] text-[hsl(var(--success-foreground))] hover:bg-[hsl(var(--success-background))]/90",
        warning:
          "bg-[hsl(var(--warning-background))] text-[hsl(var(--warning-foreground))] hover:bg-[hsl(var(--warning-background))]/90",
        danger:
          "bg-[hsl(var(--danger-background))] text-[hsl(var(--danger-foreground))] hover:bg-[hsl(var(--danger-background))]/90",
        info:
          "bg-[hsl(var(--info-background))] text-[hsl(var(--info-foreground))] hover:bg-[hsl(var(--info-background))]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TOAST_ICONS: Record<
  "success" | "warning" | "danger" | "info",
  React.ReactNode
> = {
  success: <CheckCircle2 className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  danger: <XCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const PROGRESS_BAR_COLORS: Record<string, Record<string, string>> = {
  default: {
    default: "bg-[hsl(var(--primary)/0.7)]",
    success: "bg-[hsl(var(--success-foreground)/0.7)]",
    danger: "bg-[hsl(var(--danger-foreground)/0.7)]",
    warning: "bg-[hsl(var(--warning-foreground)/0.7)]",
    info: "bg-[hsl(var(--info-foreground)/0.7)]",
  },
  sleek: {
    default: "bg-[hsl(var(--primary)/0.7)]",
    success: "bg-[hsl(var(--success-background)/0.7)]",
    danger: "bg-[hsl(var(--danger-background)/0.7)]",
    warning: "bg-[hsl(var(--warning-background)/0.7)]",
    info: "bg-[hsl(var(--info-background)/0.7)]",
  }
};

const ORIGIN_MAP: Record<ToastPosition, string> = {
  "top-center": "top center",
  "bottom-center": "bottom center",
  "top-left": "top left",
  "bottom-left": "bottom left",
  "top-right": "top right",
  "bottom-right": "bottom right",
};

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface ToastProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof toastVariants> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  id?: string;
  onLayout?: (id: string, height: number) => void;
  position?: ToastPosition;
  action?: ToastAction;
  duration?: number;
  remainingTime?: number; // ADDED
  model?: "default" | "sleek";
  isPaused?: boolean;
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
      onLayout,
      position = "top-center",
      action,
      duration = 5000, // Default to 5 seconds
      remainingTime = duration, // ADDED: Default to full duration
      model = "default",
      isPaused = false,
      ...props
    },
    ref
  ) => {
    const finalIcon =
      icon ?? (variant && variant !== "default" ? TOAST_ICONS[variant] : null);

    const progressBarColor = PROGRESS_BAR_COLORS[model || "default"][variant || "default"];
    
    // Determine if sleek mode is active
    const isSleek = model === "sleek";

    const controls = useAnimation();

    const toastRef = React.useRef<HTMLDivElement>(null);

    const prevHeight = React.useRef<number | null>(null);

    React.useEffect(() => {
      if (!toastRef.current || !onLayout || !props.id) return;

      const height = toastRef.current.getBoundingClientRect().height;

      if (prevHeight.current !== height) {
        prevHeight.current = height;
        onLayout(props.id!, height);
      }
    }, []);

    // MODIFIED: Effect to handle pause/resume
    React.useEffect(() => {
      // Ensure remainingTime is not negative or greater than duration
      const validRemainingTime = Math.max(0, Math.min(remainingTime, duration));

      if (isPaused) {
        controls.stop();
      } else {
        // Calculate the percentage of time remaining
        const remainingPercent = (validRemainingTime / duration) * 100;
        
        controls.set({ width: `${remainingPercent}%` }); // Set bar to current position
        controls.start({
          width: "0%",
          // Animate over the *remaining* time
          transition: { duration: validRemainingTime / 1000, ease: "linear" }, 
        });
      }
    }, [isPaused, duration, remainingTime, controls]);

    return (
      <motion.div
        ref={toastRef}
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        style={{
          transformOrigin: ORIGIN_MAP[position],
        }}
      >
        <div
          ref={ref}
          className={cn(
            toastVariants({
              variant: isSleek ? "default" : variant,
              className,
            })
          )}
          role="alert"
          {...props}
        >
          {/* 3×3 GRID */}
          <div
            className="
              grid
              grid-cols-[auto_1fr_auto]
              grid-rows-[auto_auto_auto]
              gap-x-4 gap-y-2
              w-full
              relative
            "
          >
            {/* Row 1: icon */}
            {finalIcon ? (
              <div className="row-start-1 col-start-1 self-start mt-0.5">
                {finalIcon}
              </div>
            ) : (
              <div className="row-start-1 col-start-1" />
            )}

            {/* Row 1: title */}
            <div className="row-start-1 col-start-2 pt-1 font-semibold text-sm leading-tight">
              {title}
            </div>

            {/* Row 1: close/action (placed in this slot if no action button) */}
            { onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="row-start-1 col-start-3 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Row 2: description */}
            <div className="row-start-2 col-start-2 col-span-1 text-sm break-words leading-snug">
              {description}
            </div>

            {/* Row 3: action (optional, full-width row) */}
            {action ? (
              <div className="row-start-3 col-span-3 flex justify-end">
                {/* change justify-start / justify-center / justify-end */}
                <Button
                  variant={action.variant || "ghost"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className="cursor-pointer text-sm mt-2"
                >
                  {action.label}
                </Button>
              </div>
            ) : (
              <div className="row-start-3 col-span-3 h-0" />
            )}
          </div>

          {/* Progress bar flush against bottom edge */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 ${progressBarColor}`}
            style={{ width: "100%" }}
            animate={controls}
          />
        </div>

      </motion.div>
    );
  }
);

Toast.displayName = "Toast";

export { Toast };