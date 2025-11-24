"use client"

import React, { useState, useMemo, useRef, useId, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, XIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Label } from "@/components/ui/label"

export interface SelectOption<T extends string | number = string> {
  value: T
  label: React.ReactNode
}

interface BaseSelectProps<T extends string | number = string> {
  options: SelectOption<T>[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  itemClassName?: string
  label?: string
  icon?: React.ReactNode
  id?: string
  searchable?: boolean
  disabled?: boolean
}

export interface SingleSelectProps<T extends string | number = string>
  extends BaseSelectProps<T> {
  multiple?: false
  value?: T | null
  onChange?: (value: T | null) => void
}

export interface MultiSelectProps<T extends string | number = string>
  extends BaseSelectProps<T> {
  multiple: true
  value?: T[] | null
  onChange?: (value: T[] | null) => void
}

export function Select<T extends string | number = string>(
  props: SingleSelectProps<T> | MultiSelectProps<T>
) {
  const {
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
    searchable = false,
    disabled = false,
    multiple = false,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const generatedId = useId()
  const selectId = id ?? generatedId
  const dropdownId = `${selectId}-listbox`

  const selectedValues = Array.isArray(value) ? value : value ? [value] : []

  const stableOptions = useMemo(() => options, [options]);

  const filteredOptions = useMemo(() => {
    return searchable
      ? stableOptions.filter((o) =>
          String(o.label).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : stableOptions;
  }, [stableOptions, searchTerm, searchable]);

  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
  }, [filteredOptions.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const scrollToHighlighted = () => {
    if (!listRef.current || highlightedIndex < 0) return
    const optionEl = listRef.current.children[highlightedIndex] as HTMLElement
    optionEl?.scrollIntoView({ block: "nearest" })
  }

  const handleSelectOption = (optionValue: T) => {
    if (disabled) return

    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      ;(onChange as (value: T[] | null) => void)?.(
        newValues.length > 0 ? newValues : null
      )
    } else {
      ;(onChange as (value: T | null) => void)?.(optionValue)
      setIsOpen(false)
    }

    setHighlightedIndex(-1)
    setSearchTerm("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    multiple
      ? (onChange as (value: T[] | null) => void)?.(null)
      : (onChange as (value: T | null) => void)?.(null)
  }

  const displayLabel = multiple
    ? selectedValues
        .map((val) => options.find((o) => o.value === val)?.label)
        .filter(Boolean)
    : options.find((o) => o.value === value)?.label

  return (
    <div className={`grid items-center gap-x-2 ${icon || label ? "gap-y-2" : ""}`}>
      <div className="flex gap-1.5">
        {icon && <span>{icon}</span>}
        {label && <Label htmlFor={selectId}>{label}</Label>}
      </div>

      <div className="flex items-center gap-2">
        <div className={cn("relative flex-1", className)} ref={selectRef}>
          <button
            id={selectId}
            type="button"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={dropdownId}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer",
              triggerClassName
            )}
          >
            {multiple ? (
              <span className="flex flex-wrap gap-1">
                {displayLabel && Array.isArray(displayLabel) && displayLabel.length > 0
                  ? displayLabel.map((lbl, i) => (
                      <span
                        key={i}
                        className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] px-2 py-0.5 rounded text-xs"
                      >
                        {lbl}
                      </span>
                    ))
                  : <span className="text-[hsl(var(--muted-foreground))]">{placeholder}</span>}
              </span>
            ) : (
              <span className={!displayLabel ? "text-[hsl(var(--muted-foreground))]" : ""}>
                {displayLabel || placeholder}
              </span>
            )}
            <ChevronDown
              className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
            />
          </button>

          {createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  id={dropdownId}
                  role="listbox"
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute z-150 max-h-60 overflow-y-auto rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-md",
                    contentClassName
                  )}
                  style={{
                    top: (selectRef.current?.getBoundingClientRect().bottom ?? 0) + window.scrollY,
                    left: (selectRef.current?.getBoundingClientRect().left ?? 0) + window.scrollX,
                    width: selectRef.current?.getBoundingClientRect().width ?? "100%",
                  }}
                >
                  {searchable && (
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => !disabled && setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="w-full border-b border-[hsl(var(--border))] px-3 py-2.5 text-sm outline-none"
                      autoFocus
                      disabled={disabled}
                    />
                  )}
                  <ul className="p-1" ref={listRef}>
                    {filteredOptions.map((option, index) => {
                      const selected = selectedValues.includes(option.value)
                      return (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={selected}
                          onClick={() => handleSelectOption(option.value)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none",
                            index === highlightedIndex &&
                              "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                            selected && "font-semibold",
                            itemClassName
                          )}
                        >
                          {multiple && (
                            <input
                              type="checkbox"
                              checked={selected}
                              readOnly
                              className="mr-2 h-3.5 w-3.5 accent-[hsl(var(--accent))]"
                            />
                          )}
                          {option.label}
                        </li>
                      )
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] hover:cursor-pointer"
            title="Clear selection"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
