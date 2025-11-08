import * as React from "react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  icon?: React.ReactNode;
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      <div className={cn("flex items-center gap-2", label || icon ? "justify-start" : "justify-center")}>
        <input
          id={id || generatedId}
          ref={ref}
          type="checkbox"
          checked={currentChecked}
          onChange={handleChange}
          className={cn(
            "h-4 w-4 rounded border border-[hsl(var(--input))] text-[hsl(var(--primary))] ring-offset-[hsl(var(--background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        {icon && <span>{icon}</span>}
        {label && (
          <Label htmlFor={id || generatedId} className="text-sm">
            {label}
          </Label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
