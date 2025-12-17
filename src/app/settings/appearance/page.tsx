"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { updateStore, fetchStoreById } from "@/lib/utils/api";
import { UpdateStoreRequest } from "@/lib/types/user/store";
import { useSession } from "@/lib/context/session";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Download, Upload } from "lucide-react";
import Image from "next/image";

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

const initialStoreForm = {
  name: "",
  image_url: "",
  store_preferences: "",
  address: "",
  phone: "",
  city: "",
  country: "",
  postal_code: "",
  is_active: true,
};

export default function ThemeCustomizerPage() {
  const [lightColors, setLightColors] = React.useState<Record<string, string>>({});
  const [darkColors, setDarkColors] = React.useState<Record<string, string>>({});
  const [storeForm, setStoreForm] = React.useState(initialStoreForm);
  const [loading, setLoading] = React.useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  const { theme, resolvedTheme } = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentMode = (resolvedTheme || theme) === "dark" ? "dark" : "light";
  // Load store data
  React.useEffect(() => {
    const loadStoreData = async () => {
      if (!session?.token) return;
      
      try {
        const store = await fetchStoreById(session.token, 1); // Fetch store with ID 1
        setStoreForm({
          name: store.name || "",
          image_url: store.image_url || "",
          store_preferences: store.store_preferences || "",
          address: store.address || "",
          phone: store.phone || "",
          city: store.city || "",
          country: store.country || "",
          postal_code: store.postal_code || "",
          is_active: store.is_active ?? true,
        });
        
        // Load theme from management_preferences if available
        if (store.management_preferences) {
          try {
            const themeData = JSON.parse(store.management_preferences);
            if (themeData.light) {
              setLightColors(themeData.light);
              localStorage.setItem("custom-theme-light", JSON.stringify(themeData.light));
            }
            if (themeData.dark) {
              setDarkColors(themeData.dark);
              localStorage.setItem("custom-theme-dark", JSON.stringify(themeData.dark));
            }
          } catch (e) {
            console.error("Failed to parse management_preferences:", e);
          }
        }
      } catch (error) {
        console.error("Failed to load store data:", error);
      }
    };
    
    loadStoreData();
  }, [session?.token]);

  const currentColors = currentMode === "dark" ? darkColors : lightColors;
  const setCurrentColors = currentMode === "dark" ? setDarkColors : setLightColors;

  // Initialize themes from localStorage or defaults
  React.useEffect(() => {
    const savedLight = localStorage.getItem("custom-theme-light");
    const savedDark = localStorage.getItem("custom-theme-dark");
    
    if (savedLight) {
      const parsed = JSON.parse(savedLight);
      setLightColors(parsed);
    } else {
      const obj = getDefaultLightColors();
      setLightColors(obj);
    }

    if (savedDark) {
      const parsed = JSON.parse(savedDark);
      setDarkColors(parsed);
    } else {
      const obj = getDefaultDarkColors();
      setDarkColors(obj);
    }
  }, []);

  // Apply colors when theme or colors change
  React.useEffect(() => {
    if (currentMode === "dark") {
      applyColors(darkColors);
    } else {
      applyColors(lightColors);
    }
  }, [currentMode, lightColors, darkColors]);

  const getDefaultLightColors = () => {
    return {
      "background": "0 0% 100%",
      "foreground": "240 10% 3.9%",
      "primary": "240 5.9% 10%",
      "primary-foreground": "0 0% 98%",
      "secondary": "240 4.8% 95.9%",
      "secondary-foreground": "240 5.9% 10%",
      "accent": "240 4.8% 95.9%",
      "accent-foreground": "240 5.9% 10%",
      "muted": "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      "border": "240 5.9% 90%",
      "input": "240 5.9% 90%",
      "ring": "240 5.9% 10%",
      "warning-background": "42 47% 66%",
      "warning-foreground": "42 37% 93%",
      "success-background": "143 55% 65%",
      "success-foreground": "143 40% 92%",
      "danger-background": "0 55% 65%",
      "danger-foreground": "0 58% 92%",
      "info-background": "216 55% 65%",
      "info-foreground": "216 40% 92%",
    };
  };

  const getDefaultDarkColors = () => {
    return {
      "background": "240 10% 3.9%",
      "foreground": "0 0% 98%",
      "primary": "0 0% 98%",
      "primary-foreground": "240 5.9% 10%",
      "secondary": "240 3.7% 15.9%",
      "secondary-foreground": "0 0% 98%",
      "accent": "240 3.7% 15.9%",
      "accent-foreground": "0 0% 98%",
      "muted": "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      "border": "240 3.7% 15.9%",
      "input": "240 3.7% 15.9%",
      "ring": "240 4.9% 83.9%",
      "warning-background": "42 47% 66%",
      "warning-foreground": "42 37% 93%",
      "success-background": "143 55% 65%",
      "success-foreground": "143 40% 92%",
      "danger-background": "0 55% 65%",
      "danger-foreground": "0 58% 92%",
      "info-background": "216 55% 65%",
      "info-foreground": "216 40% 92%",
    };
  };

  const applyColors = (colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--${name}`, value);
    });
  };

  const updateColor = (name: string, value: string) => {
    const newColors = { ...currentColors, [name]: value };
    setCurrentColors(newColors);
    applyColors(newColors);
    
    if (currentMode === "dark") {
      localStorage.setItem("custom-theme-dark", JSON.stringify(newColors));
    } else {
      localStorage.setItem("custom-theme-light", JSON.stringify(newColors));
    }
  };

  const resetColors = () => {
    if (currentMode === "dark") {
      const defaults = getDefaultDarkColors();
      setDarkColors(defaults);
      applyColors(defaults);
      localStorage.setItem("custom-theme-dark", JSON.stringify(defaults));
    } else {
      const defaults = getDefaultLightColors();
      setLightColors(defaults);
      applyColors(defaults);
      localStorage.setItem("custom-theme-light", JSON.stringify(defaults));
    }
    toast({
      variant: "success",
      title: "Theme Reset",
      description: `${currentMode === "dark" ? "Dark" : "Light"} theme reset to defaults.`,
    });
  };

  const exportToCSS = () => {
    const cssContent = generateCSSFile(lightColors, darkColors);
    const blob = new Blob([cssContent], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "custom-theme.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      variant: "success",
      title: "Theme Exported",
      description: "CSS file downloaded successfully.",
    });
  };

  const generateCSSFile = (light: Record<string, string>, dark: Record<string, string>) => {
    let css = `:root {\n`;
    Object.entries(light).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    css += `}\n\n`;
    
    css += `.dark {\n`;
    Object.entries(dark).forEach(([key, value]) => {
      css += `  --${key}: ${value};\n`;
    });
    css += `}\n`;
    
    return css;
  };

  const importFromCSS = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { light, dark } = parseCSSFile(content);
        
        setLightColors(light);
        setDarkColors(dark);
        localStorage.setItem("custom-theme-light", JSON.stringify(light));
        localStorage.setItem("custom-theme-dark", JSON.stringify(dark));
        
        if (currentMode === "dark") {
          applyColors(dark);
        } else {
          applyColors(light);
        }
        
        toast({
          variant: "success",
          title: "Theme Imported",
          description: "CSS file imported successfully.",
        });
      } catch (error) {
        toast({
          variant: "danger",
          title: "Import Failed",
          description: "Failed to parse CSS file. Please check the format.",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const parseCSSFile = (css: string) => {
    const light: Record<string, string> = {};
    const dark: Record<string, string> = {};
    
    const rootMatch = css.match(/:root\s*{([^}]*)}/);
    if (rootMatch) {
      const vars = rootMatch[1].match(/--[\w-]+:\s*[^;]+;/g);
      vars?.forEach((v) => {
        const [key, value] = v.split(":").map((s) => s.trim());
        const varName = key.replace("--", "");
        const varValue = value.replace(";", "");
        light[varName] = varValue;
      });
    }
    
    const darkMatch = css.match(/\.dark\s*{([^}]*)}/);
    if (darkMatch) {
      const vars = darkMatch[1].match(/--[\w-]+:\s*[^;]+;/g);
      vars?.forEach((v) => {
        const [key, value] = v.split(":").map((s) => s.trim());
        const varName = key.replace("--", "");
        const varValue = value.replace(";", "");
        dark[varName] = varValue;
      });
    }
    
    return { light, dark };
  };

  const handleStoreFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
  };

  const saveStoreAndTheme = async () => {
    if (!session?.token) {
      toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update the store.",
      });
      return;
    }

    setLoading(true);
    try {
      const themeData = {
        light: lightColors,
        dark: darkColors,
      };
      
      const payload: UpdateStoreRequest = {
        name: storeForm.name || undefined,
        image_url: storeForm.image_url || undefined,
        store_preferences: storeForm.store_preferences || undefined,
        management_preferences: JSON.stringify(themeData),
        address: storeForm.address || undefined,
        phone: storeForm.phone || undefined,
        city: storeForm.city || undefined,
        country: storeForm.country || undefined,
        postal_code: storeForm.postal_code || undefined,
        is_active: storeForm.is_active,
      };
      
      await updateStore(session.token, 1, payload);
      
      toast({
        variant: "success",
        title: "Store Updated!",
        description: "Store information and theme saved successfully.",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: "danger",
          title: "Error",
          description: error.message || "Could not save store information.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Store & Theme Customizer</h1>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast({
              variant: "danger",
              title: "Debug Toast",
              description: "This is a test toast.",
            })
          }
        >
          Default Toast
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast({
              model: "sleek",
              variant: "danger",
              title: "Debug Toast",
              description: "This is a test toast.",
              action: {
                label: "Action",
                onClick: () => console.log("Action executed.")
              }
            })
          }
        >
          Sleek Toast
        </Button>
      </div>


      <div className="space-y-8">
        {/* Store Information Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col gap-2">
              {storeForm.image_url ? (
                <Image
                  src={storeForm.image_url}
                  alt="Store Preview"
                  width={480}
                  height={480}
                  className="h-auto w-full object-cover rounded border border-[hsl(var(--border))]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                  unoptimized
                />
              ) : null}
            </div>
            <Input
              label="Store Name"
              name="name"
              value={storeForm.name}
              onChange={handleStoreFormChange}
            />
            <Input
              label="Image URL"
              name="image_url"
              value={storeForm.image_url}
              onChange={handleStoreFormChange}
            />
            <Input
              label="Phone"
              name="phone"
              value={storeForm.phone}
              onChange={handleStoreFormChange}
            />
            <Input
              label="City"
              name="city"
              value={storeForm.city}
              onChange={handleStoreFormChange}
            />
            <Input
              label="Country"
              name="country"
              value={storeForm.country}
              onChange={handleStoreFormChange}
            />
            <Input
              label="Postal Code"
              name="postal_code"
              value={storeForm.postal_code}
              onChange={handleStoreFormChange}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                value={storeForm.address}
                onChange={handleStoreFormChange}
              />
            </div>
          </div>
          <Switch
            label="Store Active"
            name="is_active"
            checked={storeForm.is_active}
            onChange={(checked) => setStoreForm((prev) => ({ ...prev, is_active: checked }))}
          />
        </div>

        {/* Theme Customization Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Theme Colors - {currentMode === "dark" ? "Dark Mode" : "Light Mode"}
            </h2>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".css"
                onChange={importFromCSS}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSS
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportToCSS}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSS
              </Button>
            </div>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Switch between light and dark mode using the theme toggle to customize each theme separately.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeVariables.map(({ name, label }) => (
              <div key={name} className="flex flex-col gap-2 p-4 border border-[hsl(var(--border))] rounded-lg">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type="text"
                  value={currentColors[name] || ""}
                  onChange={(e) => updateColor(name, e.target.value)}
                  placeholder="H S% L%"
                  className="px-3 py-2 border border-[hsl(var(--border))] rounded"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hslToHex(currentColors[name] || "0 0% 0%")}
                    onChange={(e) => updateColor(name, hexToHsl(e.target.value))}
                    className="w-12 h-12 cursor-pointer"
                  />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {hslToHex(currentColors[name] || "0 0% 0%")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={resetColors}>
            Reset {currentMode === "dark" ? "Dark" : "Light"} Theme
          </Button>
          <Button onClick={saveStoreAndTheme} disabled={loading}>
            {loading ? "Saving..." : "Update Store & Theme"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// HSL <-> HEX conversion utilities
function hslToHex(hsl: string) {
  const [h, s, l] = hsl.split(" ").map((v) => parseFloat(v.replace("%", "")));
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