"use client"

import React, { useState, useEffect, useRef, useId } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Label } from "@/components/ui/label"

// Define the shape of an option
export interface SelectOption {
  value: string
  label: React.ReactNode
}

// Define the props for the Select component
export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  label?: string
  icon?: React.ReactNode
  id?: string
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  className,
  triggerClassName,
  contentClassName,
  itemClassName,
  label,
  icon,
  id,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  
  const generatedId = useId()
  const selectId = id ?? generatedId


  // Find selected option
  const selectedOption = options.find((option) => option.value === value)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelectOption = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  return (
    <div className="grid w-full items-center gap-1.5">
      <div className="flex gap-1.5">
        {icon && <span>{icon}</span>}
        {label && <Label htmlFor={selectId}>{label}</Label>}
      </div>
      <div className={cn("relative w-full", className)} ref={selectRef}>
        {/* Trigger */}
        <button
          id={selectId}
          type="button"
          role="combobox"
          aria-controls="select-list"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
        >
          <span className={!selectedOption ? "text-[hsl(var(--muted-foreground))]" : ""}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            role="listbox"
            className={cn(
              "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] shadow-md animate-in fade-in-0 zoom-in-95",
              contentClassName
            )}
          >
            <ul className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => handleSelectOption(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
                    {
                      "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]": value === option.value,
                    },
                    itemClassName
                  )}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
