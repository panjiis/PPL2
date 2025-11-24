// sidebar.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsed?: boolean }
>(({ className, collapsed = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-width duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center justify-between p-4", className)} {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

export const SidebarTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
SidebarTitle.displayName = "SidebarTitle";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 flex flex-col p-2 space-y-1 overflow-y-auto", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  collapsed?: boolean;
  active?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, children, icon, collapsed = false, active = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer text-sm hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors duration-200",
        active && "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
        collapsed && "justify-center",
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {!collapsed && children}
    </div>
  )
);
SidebarItem.displayName = "SidebarItem";

// New Tree Item Component with persistent state
interface SidebarTreeItemProps extends Omit<SidebarItemProps, 'children'> {
  label: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  path: string; // Add path for unique identification
  currentPath: string; // Add current path to check if child is active
}

export const SidebarTreeItem = React.forwardRef<HTMLDivElement, SidebarTreeItemProps>(
  ({ label, children, defaultOpen = false, icon, collapsed = false, active = false, className, path, currentPath, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(() => {
      // Check if current path starts with this item's path (meaning it's a child)
      const isCurrentPathChild = currentPath.startsWith(path) && currentPath !== path;
      
      // Check localStorage for saved state
      if (typeof window !== 'undefined') {
        const savedState = localStorage.getItem(`sidebar-tree-${path}`);
        if (savedState !== null) {
          // If current path is a child, force open regardless of saved state
          if (isCurrentPathChild) {
            return true;
          }
          return savedState === 'true';
        }
      }
      
      // If current path is a child, return true
      if (isCurrentPathChild) {
        return true;
      }
      
      // Default to open for first-time visitors or if current path matches
      return defaultOpen;
    });

    const hasChildren = !!children;

    const toggleOpen = () => {
      if (hasChildren) {
        const newState = !isOpen;
        setIsOpen(newState);
        // Save state to localStorage
        localStorage.setItem(`sidebar-tree-${path}`, newState.toString());
      }
    };

    return (
      <div ref={ref} className="w-full">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer text-sm hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-colors duration-200",
            active && "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
            className
          )}
          onClick={toggleOpen}
          {...props}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          
          {!collapsed && (
            <>
              <span className="flex-1">{label}</span>
              {hasChildren && (
                <span 
                  className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  style={{ transformOrigin: 'center' }}
                >
                  <ChevronRightIcon size={16} />
                </span>
              )}
            </>
          )}
          
          {collapsed && hasChildren && (
            <span 
              className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
              style={{ transformOrigin: 'center' }}
            >
              <ChevronRightIcon size={16} />
            </span>
          )}
        </div>
        
        <AnimatePresence>
          {hasChildren && isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="relative ml-5 border-l border-[hsl(var(--border))]">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
SidebarTreeItem.displayName = "SidebarTreeItem";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto p-4 border-t border-[hsl(var(--border))] flex flex-col gap-2",
      className
    )}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";