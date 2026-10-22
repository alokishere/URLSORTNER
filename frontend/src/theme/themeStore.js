import { useSyncExternalStore } from "react";

const KEY = "ekurl-theme";
const valid = (value) => ["system", "light", "dark"].includes(value) ? value : "system";
const browser = typeof window !== "undefined";
const isDashboardPath = (path) => /^\/(dashboard(?:\/|$)|create\/?$|analytics\/)/.test(path);
let dashboardScope = browser && isDashboardPath(window.location.pathname);
const media = browser && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
let preference = "system";
if (browser) {
  try { preference = valid(window.localStorage.getItem(KEY)); } catch { /* storage may be blocked */ }
}
const listeners = new Set();
const resolved = () => preference === "system" ? (media?.matches ? "dark" : "light") : preference;
const apply = () => {
  if (!browser) return;
  const theme = dashboardScope ? resolved() : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dim-mode", theme === "dark");
};
const notify = () => { apply(); listeners.forEach((listener) => listener()); };
const subscribe = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
if (browser) {
  apply();
  media?.addEventListener?.("change", () => { if (preference === "system") notify(); });
  window.addEventListener("storage", (event) => {
    if (event.key === KEY || event.key === null) { preference = valid(event.newValue); notify(); }
  });
}
export function setThemePreference(value) {
  preference = valid(value);
  try { window.localStorage.setItem(KEY, preference); } catch { /* keep the choice for this session */ }
  notify();
}
export function setThemePath(path) {
  dashboardScope = isDashboardPath(path);
  apply();
}
export function useTheme() {
  const selected = useSyncExternalStore(subscribe, () => preference, () => "system");
  const current = useSyncExternalStore(subscribe, resolved, () => "light");
  return { preference: selected, resolvedTheme: current, setThemePreference };
}
