import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  icon?: React.ReactNode;
  }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, icon, ...props }, ref) => (
    <div className="grid w-full items-center gap-1.5">
      {icon && <span>{icon}</span>}
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props}
      />
    </div>
  )
);
Label.displayName = "Label";

export { Label };