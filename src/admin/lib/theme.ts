import { useEffect, useState } from "react";

// Same localStorage key as the vanilla admin's theme logic, so a
// preference set before this rebuild carries over instead of resetting.
const THEME_KEY = "lumine_admin_theme";
export type ThemePref = "light" | "dark" | "system";

function resolveDark(pref: ThemePref, systemDark: boolean) {
  return pref === "dark" || (pref === "system" && systemDark);
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem(THEME_KEY) as ThemePref) || "light");

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.classList.toggle("dark", resolveDark(pref, mql.matches));
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [pref]);

  const setTheme = (next: ThemePref) => {
    localStorage.setItem(THEME_KEY, next);
    setPref(next);
  };

  return { pref, setTheme };
}
