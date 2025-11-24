"use client";

import React, { useState, useMemo, useRef, useId, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, XIcon, CommandIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SearchOption<T extends string | number = string> {
  value: T;
  label: React.ReactNode;
  keywords?: string[];
  icon?: React.ReactNode;
  group?: string;
}

interface SearchBarProps<T extends string | number = string> {
  options: SearchOption<T>[];
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  onSearch?: (term: string) => void;
  onSelect?: (option: SearchOption<T>) => void;
  groups?: boolean;
  showIcons?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  /** The controlled value of the search input */
  value?: string;
  /** Callback when the search input value changes */
  onValueChange?: (value: string) => void;
}

export function AdvancedSearch<T extends string | number = string>({
  options,
  placeholder = "Search...",
  className,
  contentClassName,
  itemClassName,
  onSearch,
  onSelect,
  groups = false,
  showIcons = true,
  autoFocus = false,
  disabled = false,
  value,
  onValueChange,
}: SearchBarProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  
  // Controlled / Uncontrolled state logic
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const isControlled = value !== undefined;
  const searchTerm = isControlled ? value : internalSearchTerm;

  const updateSearchTerm = (newValue: string) => {
    if (!isControlled) {
      setInternalSearchTerm(newValue);
    }
    onValueChange?.(newValue);
  };
  
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const searchId = `search-${generatedId}`;

  // CHANGED: 1. Add useMemo to check OS
  const isMac = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  }, []);

  // CHANGED: 2. Update keyboard shortcut logic
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k") {
        const shortcutPressed = isMac ? e.metaKey : e.ctrlKey;

        if (shortcutPressed) {
          e.preventDefault();
          if (searchRef.current) {
            searchRef.current.focus();
            setIsOpen(true);
          }
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isMac]); // Add isMac to dependency array

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;

    const term = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        String(option.label).toLowerCase().includes(term) ||
        (option.keywords?.some((k) => k.toLowerCase().includes(term)) ??
          false) ||
        (option.group && option.group.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  // Group options
  type GroupedOption = { name: string; options: SearchOption<T>[] };
  type UngroupedOption = { options: SearchOption<T>[] };

  const groupedOptions = useMemo((): (GroupedOption | UngroupedOption)[] => {
    if (!groups) return [{ options: filteredOptions }];

    const groupsMap = new Map<string, SearchOption<T>[]>();
    filteredOptions.forEach((option) => {
      const groupName = option.group || "Other";
      if (!groupsMap.has(groupName)) {
        groupsMap.set(groupName, []);
      }
      groupsMap.get(groupName)!.push(option);
    });

    return Array.from(groupsMap.entries()).map(([groupName, options]) => ({
      name: groupName,
      options,
    }));
  }, [filteredOptions, groups]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        // We don't clear the term, just close the dropdown
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev + 1;
          const total = filteredOptions.length;
          return next >= total ? 0 : next;
        });
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const total = filteredOptions.length;
          return prev <= 0 ? total - 1 : prev - 1;
        });
        return;
      }

      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) {
          onSelect?.(option);
          setIsOpen(false);
          // Set input value to the selected label
          updateSearchTerm(String(option.label));
        }
        return;
      }
    };

    if (isOpen && searchRef.current) {
      const input = searchRef.current;
      input.addEventListener(
        "keydown",
        handleKeyDown as unknown as (e: Event) => void
      );
      return () =>
        input.removeEventListener(
          "keydown",
          handleKeyDown as unknown as (e: Event) => void
        );
    }
  }, [isOpen, highlightedIndex, filteredOptions, onSelect, updateSearchTerm]);

  // Scroll to highlighted item
  useEffect(() => {
    if (!listRef.current || highlightedIndex < 0) return;

    const container = listRef.current;
    const items = container.querySelectorAll("[data-search-item]");
    const item = items[highlightedIndex] as HTMLElement;

    if (item) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (itemRect.bottom > containerRect.bottom) {
        container.scrollTop += itemRect.bottom - containerRect.bottom;
      } else if (itemRect.top < containerRect.top) {
        container.scrollTop -= containerRect.top - itemRect.top;
      }
    }
  }, [highlightedIndex]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input
  useEffect(() => {
    if (isOpen && searchRef.current && autoFocus) {
      searchRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  // Call onSearch
  useEffect(() => {
    onSearch?.(searchTerm);
  }, [searchTerm, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(-1); // Reset highlight on new typing
  };

  const handleItemSelect = (option: SearchOption<T>) => {
    onSelect?.(option);
    setIsOpen(false);
    // Set input value to the selected label
    updateSearchTerm(String(option.label));
  };

  // Calculate position
  const getDropdownPosition = () => {
    if (!searchRef.current) return { top: 0, left: 0, width: "100%" };

    const rect = searchRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const dropdownHeight = 300; // Estimated height
    const spaceBelow = windowHeight - rect.bottom;

    let top = rect.bottom + window.scrollY;
    const left = rect.left + window.scrollX;
    const width = rect.width;

    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight - 8; // Position above
    } else {
      top = rect.bottom + window.scrollY + 8; // Position below
    }

    return { top, left, width };
  };

  return (
    <div className="relative max-w-sm w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          id={searchId}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={searchRef}
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              updateSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center justify-center"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
        
        {/* CHANGED: 3. Conditionally render shortcut key */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          <kbd className="hidden sm:inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            {isMac ? <CommandIcon className="h-2.5 w-2.5" /> : "Ctrl"}
          </kbd>
          <kbd className="hidden sm:inline-flex h-5 w-5 items-center justify-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs font-medium text-[hsl(var(--muted-foreground))]">
            K
          </kbd>
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 max-h-96 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-lg",
                contentClassName
              )}
              style={{
                ...getDropdownPosition(),
                width: `${getDropdownPosition().width}px`,
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <div className="overflow-y-auto max-h-80" ref={listRef}>
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    No results found
                  </div>
                ) : groups ? (
                  groupedOptions.map((group, groupIndex) => (
                    <div key={(group as GroupedOption).name || groupIndex}>
                      <div className="px-3 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]">
                        {(group as GroupedOption).name}
                      </div>
                      {(group as GroupedOption).options.map(
                        (option, optionIndex) => {
                          const globalIndex =
                            groupedOptions
                              .slice(0, groupIndex)
                              .reduce(
                                (acc, g) =>
                                  acc + (g as GroupedOption).options.length,
                                0
                              ) + optionIndex;

                          return (
                            <div
                              key={`${option.value}-${globalIndex}`}
                              data-search-item
                              onClick={() => handleItemSelect(option)}
                              onMouseEnter={() =>
                                setHighlightedIndex(globalIndex)
                              }
                              className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-3 text-sm outline-none",
                                globalIndex === highlightedIndex &&
                                  "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                                itemClassName
                              )}
                            >
                              {showIcons && option.icon && (
                                <span className="mr-2 flex h-4 w-4 items-center justify-center">
                                  {option.icon}
                                </span>
                              )}
                              <span className="flex-1 truncate">
                                {option.label}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ))
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={`${option.value}-${index}`}
                      data-search-item
                      onClick={() => handleItemSelect(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-3 pr-3 text-sm outline-none",
                        index === highlightedIndex &&
                          "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
                        itemClassName
                      )}
                    >
                      {showIcons && option.icon && (
                        <span className="mr-2 flex h-4 w-4 items-center justify-center">
                          {option.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}