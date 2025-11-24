"use client";

import * as React from "react";
import { useId, useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

export function formatCurrency(value: number, locale = "id-ID", currency = "IDR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  variant?: "default" | "currency";
  onValueChange?: (value: number | null, e: React.ChangeEvent<HTMLInputElement>) => void;
  currency?: string; // optional, defaults to IDR
  locale?: string;   // optional, defaults to id-ID
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    value,
    onChange,
    onValueChange,
    label,
    icon,
    variant = "default",
    currency = "IDR",
    locale = "id-ID",
    ...props
  }, ref) => {
    const id = useId();
    const [rawValue, setRawValue] = useState<string>("");
    const [emailError, setEmailError] = useState<string | null>(null);

    // Initialize rawValue from prop value
    useEffect(() => {
      if (variant === "currency" && typeof value === "number" && !isNaN(value)) {
        setRawValue(value.toString());
      } else {
        setRawValue(value?.toString() || "");
      }
    }, [value, variant]);

    const parseNumber = (val: string) => {
      if (!val) return 0;
      const cleaned = val.replace(/\./g, "").replace(/,/g, ".");
      return parseFloat(cleaned);
    };

    const validateEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;

      if (variant === "currency") {
        const digitsOnly = val.replace(/[^\d]/g, "");
        setRawValue(digitsOnly);
        onValueChange?.(digitsOnly ? parseInt(digitsOnly, 10) : null, e);
      } else {
        setRawValue(val);

        if (type === "email") {
          setEmailError(val === "" || validateEmail(val) ? null : "Invalid email format");
        }
      }

      onChange?.(e);
    };

    const handleBlur = () => {
      if (variant === "currency") {
        const num = parseNumber(rawValue);
        if (!isNaN(num)) {
          setRawValue(
            num.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          );
        }
      }

      if (type === "email" && rawValue && !validateEmail(rawValue)) {
        setEmailError("Invalid email format");
      }
    };

    const handleFocus = () => {
      if (variant === "currency") {
        setRawValue(rawValue.replace(/,00$/, ""));
      }
    };

    const isCurrency = variant === "currency";

    const inputValue = isCurrency ? rawValue : rawValue;

    const currencyPrefix = isCurrency
      ? formatCurrency(0, locale, currency).replace(/[\d.,\s]/g, "")
      : "";

    return (
      <div className={`grid w-full items-center gap-x-2 ${icon || label ? "gap-y-2" : ""}`}>
        <div className="flex gap-1.5">
          {icon && <span>{icon}</span>}
          {label && <Label htmlFor={props.id || id}>{label}</Label>}
        </div>
        {isCurrency ? (
          <div className="flex items-center border border-[hsl(var(--input))] rounded-md h-10 bg-[hsl(var(--background))] overflow-hidden">
            <span className="h-full px-3 flex items-center border-r border-[hsl(var(--border))] bg-[hsl(var(--foreground))]/5">
              {currencyPrefix}
            </span>
            <input
              type="text"
              ref={ref}
              id={props.id || id}
              value={inputValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={cn(
                "flex-1 h-full border-none bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none",
                className
              )}
              {...props}
            />
          </div>
        ) : (
          <input
            type={type}
            ref={ref}
            id={props.id || id}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn(
              "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            {...props}
          />
        )}
        {type === "email" && emailError && (
          <span className="text-sm text-red-500">{emailError}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
