"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

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
  <div ref={ref} className={cn("flex-1 flex flex-col p-2 space-y-1", className)} {...props} />
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
