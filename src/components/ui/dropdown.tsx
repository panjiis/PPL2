"use client";

import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  createContext,
} from "react";
import { cn } from "@/lib/utils/cn";
import ReactDOM from "react-dom";

// --- NEW: Ref Merging Utilities ---
type Ref<T> = React.RefObject<T> | React.MutableRefObject<T> | React.ForwardedRef<T>;

function setRef<T>(ref: Ref<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && 'current' in ref) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return React.useMemo(() => {
    if (refs.every((ref) => ref == null)) {
      return null;
    }
    return (node: T) => {
      refs.forEach((ref) => {
        if (ref) {
          setRef(ref, node);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}


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

// --- Trigger (UPDATED) ---
interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild,
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdownMenu();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childRef = (children as any)?.ref;
  const mergedRef = useMergeRefs(triggerRef, childRef);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  if (asChild && React.isValidElement(children)) {
    
    const childProps = children.props as {
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    };

    const combinedOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof childProps.onClick === "function") {
        childProps.onClick(e);
      }
      handleClick(e);
    };

    return React.cloneElement(children, {
      ref: mergedRef,
      onClick: combinedOnClick,
      "aria-haspopup": "true",
      "aria-expanded": isOpen,
    } as Partial<typeof children.props>);
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

// --- Content (UPDATED) ---
interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className,
  align = "start",
}) => {
  const { isOpen, setIsOpen, triggerRef, contentRef } = useDropdownMenu();
  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left?: number;
    right?: number;
    minWidth: number;
  } | null>(null);

  useOnClickOutside(triggerRef, contentRef, () => setIsOpen(false));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) {
      // NEW: Reset coords when closing
      setCoords(null);
      return;
    }

    const calculatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const newTop = rect.bottom + scrollY + 8; // 8px for mt-2
      const newMinWidth = rect.width;

      if (align === "end") {
        setCoords({
          top: newTop,
          right: window.innerWidth - rect.right - scrollX,
          minWidth: newMinWidth,
        });
      } else {
        setCoords({
          top: newTop,
          left: rect.left + scrollX,
          minWidth: newMinWidth,
        });
      }
    };

    calculatePosition();

    window.addEventListener("resize", calculatePosition);
    document.addEventListener("scroll", calculatePosition, true);

    return () => {
      window.removeEventListener("resize", calculatePosition);
      document.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isOpen, triggerRef, align]);

  // Do not render on server or if closed
  if (!isOpen || !isMounted) return null;
  
  // NEW: Do not render until coords are calculated
  // This prevents flashing at (0,0)
  if (!coords) return null;

  const contentElement = (
    <div
      ref={contentRef}
      role="menu"
      data-align={align}
      style={{
        position: "absolute",
        top: `${coords.top}px`,
        left: coords.left !== undefined ? `${coords.left}px` : "auto",
        right: coords.right !== undefined ? `${coords.right}px` : "auto",
        minWidth: `${coords.minWidth}px`,
      }}
      className={cn(
        "z-50 min-w-[8rem] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1 shadow-md outline-none",
        align === "end" ? "origin-top-right" : "origin-top-left",
        className
      )}
    >
      {children}
    </div>
  );

  return ReactDOM.createPortal(contentElement, document.body);
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