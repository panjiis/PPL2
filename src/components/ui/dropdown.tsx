"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  createContext,
} from "react";
import { cn } from "@/lib/utils/cn";

// --- Context ---
interface DropdownMenuContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext);
  if (!context)
    throw new Error("useDropdownMenu must be used within a DropdownMenu provider");
  return context;
};

// --- Click outside hook (ignores clicks on trigger) ---
function useOnClickOutside(
  triggerRef: React.RefObject<HTMLElement | null>,
  contentRef: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !contentRef.current?.contains(target)
      ) {
        handler();
      }
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [triggerRef, contentRef, handler]);
}

// --- Main Dropdown ---
const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  return (
    <DropdownMenuContext.Provider
      value={{ isOpen, setIsOpen, triggerRef, contentRef }}
    >
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

// --- Trigger ---
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ 
  children, 
  asChild 
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    }>;
    
    const combinedOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      child.props.onClick?.(e);
      handleClick(e);
    };

    return React.cloneElement(child, {
      onClick: combinedOnClick,
      "aria-haspopup": "true",
      "aria-expanded": isOpen,
    } as Partial<typeof child.props>);
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      className="inline-flex"
      aria-haspopup="true"
      aria-expanded={isOpen}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// --- Content ---
interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ 
  children, 
  className, 
  align = "start" 
}) => {
  const { isOpen, setIsOpen, triggerRef, contentRef } = useDropdownMenu();

  useOnClickOutside(triggerRef, contentRef, () => setIsOpen(false));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      role="menu"
      data-align={align}
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1 shadow-md outline-none",
        align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
        className
      )}
    >
      {children}
    </div>
  );
};

// --- Item ---
interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ 
  children, 
  className, 
  onClick 
}) => {
  const { setIsOpen } = useDropdownMenu();

  return (
    <div
      role="menuitem"
      tabIndex={0} // make it focusable
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors",
        "hover:bg-[hsl(var(--foreground))]/5 hover:text-[hsl(var(--foreground))]",
        "focus:bg-[hsl(var(--foreground))]/5 focus:text-[hsl(var(--foreground))] outline-none",
        className
      )}
      onClick={() => {
        onClick?.();
        setIsOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
          setIsOpen(false);
        }
      }}
    >
      {children}
    </div>
  );
};

// --- Label ---
interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
}

const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className,
}) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
    {children}
  </div>
);

// --- Group ---
const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
};