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
import { motion, AnimatePresence } from "framer-motion";

// --- Ref Utilities ---
type Ref<T> =
  | React.RefObject<T>
  | React.MutableRefObject<T>
  | React.ForwardedRef<T>;

function setRef<T>(ref: Ref<T>, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && "current" in ref) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

function useMergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return React.useMemo(() => {
    if (refs.every((ref) => ref == null)) return null;
    return (node: T) => refs.forEach((ref) => ref && setRef(ref, node));
  }, [refs]);
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
  const ctx = useContext(DropdownMenuContext);
  if (!ctx)
    throw new Error("useDropdownMenu must be used within a DropdownMenu provider");
  return ctx;
};

// --- Click outside ---
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
      )
        handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [triggerRef, contentRef, handler]);
}

// --- Main ---
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
      childProps.onClick?.(e);
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
  position?: "top" | "bottom" | "left" | "right" | "auto";
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className,
  align = "start",
  position = "auto",
}) => {
  const { isOpen, setIsOpen, triggerRef, contentRef } = useDropdownMenu();

  const [coords, setCoords] = useState<{
    top: number;
    left?: number;
    right?: number;
    minWidth: number;
  }>({
    top: 0,
    left: 0,
    minWidth: 0,
  });

  useOnClickOutside(triggerRef, contentRef, () => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;

    const calculatePosition = () => {
      const triggerEl = triggerRef.current;
      const contentEl = contentRef.current;
      if (!triggerEl || !contentEl) return;

      const triggerRect = triggerEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      const margin = 8;

      let top = 0;
      let left: number | undefined;
      let right: number | undefined;

      // Default top alignment (used by top/bottom)
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Handle vertical placement
      if (position === "top") {
        top = triggerRect.top + scrollY - contentRect.height - margin;
      } else if (position === "bottom") {
        top = triggerRect.bottom + scrollY + margin;
      } else if (position === "left" || position === "right") {
        // Vertical alignment for side menus
        if (align === "start") top = triggerRect.top + scrollY;
        else if (align === "end") top = triggerRect.bottom + scrollY - contentRect.height;
        else top = triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2;
      } else {
        // Auto position (top/bottom based on space)
        top =
          spaceBelow >= contentRect.height || spaceBelow >= spaceAbove
            ? triggerRect.bottom + scrollY + margin
            : triggerRect.top + scrollY - contentRect.height - margin;
      }

      // Handle horizontal placement
      if (position === "left") {
        right = window.innerWidth - triggerRect.left + scrollX + margin;
      } else if (position === "right") {
        left = triggerRect.right + scrollX + margin;
      } else if (align === "end") {
        right = window.innerWidth - triggerRect.right - scrollX;
      } else if (align === "center") {
        left = triggerRect.left + scrollX + triggerRect.width / 2 - contentRect.width / 2;
      } else {
        left = triggerRect.left + scrollX;
      }

      setCoords({
        top,
        left,
        right,
        minWidth: triggerRect.width,
      });
    };

    const raf = requestAnimationFrame(() => {
      calculatePosition();
      requestAnimationFrame(calculatePosition);
    });

    window.addEventListener("resize", calculatePosition);
    document.addEventListener("scroll", calculatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", calculatePosition);
      document.removeEventListener("scroll", calculatePosition, true);
    };
  }, [isOpen, align, position, triggerRef, contentRef]);

  // Determine animation direction based on position
  const getAnimationVariants = () => {
    if (position === "left") {
      return {
        initial: { opacity: 0, scale: 0.95, x: 16 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, x: 16 }
      };
    } else if (position === "right") {
      return {
        initial: { opacity: 0, scale: 0.95, x: -16 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, x: -16 }
      };
    } else if (position === "top") {
      return {
        initial: { opacity: 0, scale: 0.95, y: 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 16 }
      };
    } else {
      // bottom or auto
      return {
        initial: { opacity: 0, scale: 0.95, y: -16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -16 }
      };
    }
  };

  const variants = getAnimationVariants();

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          role="menu"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: `${coords.top}px`,
            left: coords.left !== undefined ? `${coords.left}px` : "auto",
            right: coords.right !== undefined ? `${coords.right}px` : "auto",
            minWidth: `${coords.minWidth}px`,
          }}
          className={cn(
            "z-[5000] min-w-[8rem] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1 shadow-md outline-none",
            position === "left"
              ? "origin-center-right"
              : position === "right"
              ? "origin-center-left"
              : position === "top"
              ? "origin-bottom-center"
              : "origin-top-center", // bottom or auto
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// --- Items ---
interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  onClick,
}) => {
  const { setIsOpen } = useDropdownMenu();
  return (
    <div
      role="menuitem"
      tabIndex={0}
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

const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>{children}</div>;

const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
};
