"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved || "system";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (t === "light") root.classList.add("light");
    else if (t === "dark") root.classList.add("dark");
    // system = no override → @media handles it
  }

  function changeTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  }

  return { theme, setTheme: changeTheme };
}
