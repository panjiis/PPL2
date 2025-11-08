"use client"

import React, { useState, useEffect, useRef, useId } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, XIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Label } from "@/components/ui/label"

export interface SelectOption<T extends string | number = string> {
  value: T
  label: React.ReactNode
}

export interface SelectProps<T extends string | number = string> {
  options: SelectOption<T>[]
  value?: T | null
  onChange?: (value: T | null) => void
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

export const Select = <T extends string | number = string>({
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
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const generatedId = useId()
  const selectId = id ?? generatedId
  const dropdownId = `${selectId}-listbox`

  const filteredOptions = searchable
    ? options.filter((o) =>
        String(o.label).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
  }, [filteredOptions])

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
    const isInput = (e.target as HTMLElement).tagName === "INPUT"

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        setIsOpen(true)
        setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1)
      }
      return
    }

    if (!isInput) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
          scrollToHighlighted()
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
          scrollToHighlighted()
          break
        case "Enter":
        case " ":
          e.preventDefault()
          const option = filteredOptions[highlightedIndex]
          if (option) handleSelectOption(option.value)
          break
        case "Escape":
          e.preventDefault()
          setIsOpen(false)
          setSearchTerm("")
          break
      }
    }
  }

  const scrollToHighlighted = () => {
    if (!listRef.current || highlightedIndex < 0) return
    const optionEl = listRef.current.children[highlightedIndex] as HTMLElement
    optionEl?.scrollIntoView({ block: "nearest" })
  }

  const handleSelectOption = (optionValue: T | null) => {
    if (disabled) return
    onChange?.(optionValue)
    setIsOpen(false)
    setHighlightedIndex(-1)
    setSearchTerm("")
  }

  return (
    <div className="grid w-full items-center gap-1.5">
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
            onKeyDown={handleKeyDown}
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50",
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
                      onKeyDown={handleKeyDown}
                      placeholder="Search..."
                      className={cn(
                        "w-full border-b border-[hsl(var(--border))] px-3 py-2.5 text-sm outline-none",
                        disabled && "pointer-events-none opacity-50 cursor-not-allowed"
                      )}
                      autoFocus
                      disabled={disabled}
                    />
                  )}
                  <ul className="p-1" ref={listRef}>
                    {filteredOptions.map((option, index) => (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={value === option.value}
                        onClick={() => handleSelectOption(option.value)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cn(
                          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none",
                          index === highlightedIndex &&
                            "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                          value === option.value && "font-semibold",
                          itemClassName
                        )}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
        </div>

        {value !== null && (
          <button
            type="button"
            onClick={() => handleSelectOption(null)}
            className="h-10 w-10 flex items-center justify-center rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
            title="Clear selection"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
