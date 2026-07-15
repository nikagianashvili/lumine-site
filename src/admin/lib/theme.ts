import { useSyncExternalStore } from "react";

// Same localStorage key as the vanilla admin's theme logic, so a
// preference set before this rebuild carries over instead of resetting.
const THEME_KEY = "lumine_admin_theme";
export type ThemePref = "light" | "dark" | "system";

// A shared external store rather than per-hook useState: the theme control
// now renders in two places (Sidebar rail on md+, TopNav avatar menu on
// mobile) and both must reflect a change made in either. Applying at module
// load also themes the page before React mounts — no light-mode flash.
let pref: ThemePref = (localStorage.getItem(THEME_KEY) as ThemePref) || "light";
const listeners = new Set<() => void>();
const mql = window.matchMedia("(prefers-color-scheme: dark)");

function resolveDark(p: ThemePref, systemDark: boolean) {
  return p === "dark" || (p === "system" && systemDark);
}

function apply() {
  document.documentElement.classList.toggle("dark", resolveDark(pref, mql.matches));
}

mql.addEventListener("change", apply);
apply();

export function setTheme(next: ThemePref) {
  pref = next;
  localStorage.setItem(THEME_KEY, next);
  apply();
  listeners.forEach((l) => l());
}

export function useTheme() {
  const current = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => pref,
  );
  return { pref: current, setTheme };
}
