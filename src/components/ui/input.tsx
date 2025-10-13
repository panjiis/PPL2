import * as React from "react";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, ...props }, ref) => {
    const id = useId();

    return (
      <div className={`grid w-full items-center gap-x-2 ${ icon || label ? 'gap-y-2' : ''}`}>
        <div className="flex gap-2">
          {icon && <span>{icon}</span>}
          {label && <Label htmlFor={props.id || id}>{label}</Label>}
        </div>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-[hsl(var(--background))] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          id={props.id || id}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };