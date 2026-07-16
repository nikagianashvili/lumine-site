import { useSyncExternalStore } from "react";

// Same pattern as src/admin/lib/theme.ts, own localStorage key so a
// client's theme choice doesn't collide with a team member's on a shared
// browser.
const THEME_KEY = "lumine_portal_theme";
export type ThemePref = "light" | "dark" | "system";

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
