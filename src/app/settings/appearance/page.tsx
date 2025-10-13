"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const themeVariables = [
  { name: "background", label: "Background" },
  { name: "foreground", label: "Foreground" },
  { name: "primary", label: "Primary" },
  { name: "primary-foreground", label: "Primary Foreground" },
  { name: "secondary", label: "Secondary" },
  { name: "secondary-foreground", label: "Secondary Foreground" },
  { name: "accent", label: "Accent" },
  { name: "accent-foreground", label: "Accent Foreground" },
  { name: "muted", label: "Muted" },
  { name: "muted-foreground", label: "Muted Foreground" },
  { name: "border", label: "Border" },
  { name: "input", label: "Input" },
  { name: "ring", label: "Ring" },
  { name: "warning-background", label: "Warning Background" },
  { name: "warning-foreground", label: "Warning Foreground" },
  { name: "success-background", label: "Success Background" },
  { name: "success-foreground", label: "Success Foreground" },
  { name: "danger-background", label: "Danger Background" },
  { name: "danger-foreground", label: "Danger Foreground" },
  { name: "info-background", label: "Info Background" },
  { name: "info-foreground", label: "Info Foreground" },
];

export default function ThemeCustomizerPage() {
  const [colors, setColors] = React.useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("custom-theme");
    if (saved) return JSON.parse(saved);
    const computed = getComputedStyle(document.documentElement);
    const obj: Record<string, string> = {};
    themeVariables.forEach(({ name }) => {
      obj[name] = computed.getPropertyValue(`--${name}`).trim() || "0 0% 0%";
    });
    return obj;
  });

  const updateColor = (name: string, value: string) => {
    const root = document.documentElement;
    root.style.setProperty(`--${name}`, value);
    const newColors = { ...colors, [name]: value };
    setColors(newColors);
    localStorage.setItem("custom-theme", JSON.stringify(newColors));
  };

  const resetColors = () => {
    localStorage.removeItem("custom-theme");
    window.location.reload();
  };

  const { toast } = useToast();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Theme Customizer</h1>
      <div className="grid grid-cols-2 gap-4">
        {themeVariables.map(({ name, label }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-sm font-medium">{label}</label>
            <input
              type="text"
              value={colors[name] || ""}
              onChange={(e) => updateColor(name, e.target.value)}
              placeholder="H S% L%"
              className="px-2 py-1"
            />
            <input
              type="color"
              value={hslToHex(colors[name] || "0 0% 0%")}
              onChange={(e) => updateColor(name, hexToHsl(e.target.value))}
              className="w-10 h-10 p-0"
            />
          </div>
        ))}
      </div>
      <Button variant="destructive"
        onClick={() => {
          localStorage.setItem("theme-reset-toast", "true");
          resetColors();
        }}
        >
        Reset Theme
      </Button>

      <Button
        onClick={() => {
          toast({
            variant: "success",
            title: "Success!",
            description: "Your settings were saved successfully.",
          });
        }}
      >
        Show Success
      </Button>

      <Button
        variant="danger"
        onClick={() => {
          toast({
            variant: "danger",
            title: "Something went wrong.",
            description: "Could not fetch data from the server.",
          });
        }}
      >
        Show Error
      </Button>
    </div>
  );
}

// Utilities to convert between HSL and HEX
function hslToHex(hsl: string) {
  const [h, s, l] = hsl
    .split(" ")
    .map((v) => parseFloat(v.replace("%", "")));
  const a = s / 100;
  const b = l / 100;

  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = b - a * Math.min(b, 1 - b) * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(color * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    l = (max + min) / 2;
  let h = 0,
    s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
