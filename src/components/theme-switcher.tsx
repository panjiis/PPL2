"use client";
import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex gap-1 bg-[hsl(var(--secondary))] rounded-lg p-1 ${className ?? ""}`}>
        <div className="h-9 w-9" />
        <div className="h-9 w-9" />
        <div className="h-9 w-9" />
      </div>
    );
  }

  const themes = [
    { name: "light", icon: Sun, label: "Light theme" },
    { name: "system", icon: Monitor, label: "System theme" },
    { name: "dark", icon: Moon, label: "Dark theme" },
  ] as const;

  return (
    <div className={`flex gap-1 bg-[hsl(var(--secondary))] rounded-lg p-1 ${className ?? ""}`}>
      {themes.map(({ name, icon: Icon, label }) => (
        <Button
          key={name}
          size="icon"
          variant={theme === name ? "default" : "ghost"}
          onClick={() => setTheme(name)}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
