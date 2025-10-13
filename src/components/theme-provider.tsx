"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const saved = localStorage.getItem("custom-theme");
    if (saved) {
      const themeColors = JSON.parse(saved) as Record<string, string>;
      const root = document.documentElement;
      Object.entries(themeColors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}
