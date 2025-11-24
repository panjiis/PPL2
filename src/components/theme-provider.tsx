"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ThemeColorApplier() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const applyThemeColors = React.useCallback((colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    try {
      const currentTheme = resolvedTheme || theme;
      const storageKey = currentTheme === "dark" ? "custom-theme-dark" : "custom-theme-light";
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const themeColors = JSON.parse(saved) as Record<string, string>;
        applyThemeColors(themeColors);
      }
    } catch (err) {
      console.error("Failed to parse custom theme from localStorage:", err);
    }
  }, [mounted, theme, resolvedTheme, applyThemeColors]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeColorApplier />
      {children}
    </NextThemesProvider>
  );
}