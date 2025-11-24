import * as React from "react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  icon?: React.ReactNode;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, defaultChecked = false, checked, onChange, label, icon, id, ...props }, ref) => {
    const generatedId = useId();
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.checked;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next, e);
    };

    return (
      <div
        className={cn(
          "flex items-center gap-2",
          label || icon ? "justify-start" : "justify-center"
        )}
      >
        <label
          htmlFor={id || generatedId}
          className="relative inline-flex shrink-0 h-5 w-9 cursor-pointer items-center"
        >
          <input
            id={id || generatedId}
            ref={ref}
            type="checkbox"
            checked={currentChecked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />

          <span
            className={cn(
              "absolute inset-0 rounded-full bg-[hsl(var(--input))] transition-colors peer-checked:bg-[hsl(var(--primary))] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
            )}
          />

          <span
            className={cn(
              "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[hsl(var(--primary))] peer-checked:bg-[hsl(var(--primary-foreground))] transition-transform",
              "peer-checked:translate-x-4"
            )}
          />
        </label>

        {icon && <span>{icon}</span>}

        {label && (
          <Label htmlFor={id || generatedId} className="text-sm cursor-pointer">
            {label}
          </Label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };