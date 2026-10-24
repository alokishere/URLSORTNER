import { useSyncExternalStore } from "react";

const KEY = "ekurl-theme";
const browser = typeof window !== "undefined";
const isDashboardPath = (path) => /^\/(dashboard(?:\/|$)|create\/?$|analytics\/)/.test(path);
const listeners = new Set();
let dashboardScope = browser && isDashboardPath(window.location.pathname);
let preference = "light";

if (browser) {
  try {
    preference = window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    preference = "light";
  }
}

const applyTheme = () => {
  if (!browser) return;
  const dark = dashboardScope && preference === "dark";
  document.documentElement.classList.toggle("dim-mode", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
};

const notify = () => {
  applyTheme();
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

if (browser) {
  applyTheme();
  window.addEventListener("storage", (event) => {
    if (event.key !== KEY && event.key !== null) return;
    preference = event.newValue === "dark" ? "dark" : "light";
    notify();
  });
}

export const setThemePreference = (value) => {
  preference = value === "dark" ? "dark" : "light";
  try {
    window.localStorage.setItem(KEY, preference);
  } catch {
    // The current tab still receives the new theme when storage is unavailable.
  }
  notify();
};

export const toggleTheme = () => setThemePreference(preference === "dark" ? "light" : "dark");

export const setThemePath = (path) => {
  dashboardScope = isDashboardPath(path);
  applyTheme();
};

export const useTheme = () => {
  const selected = useSyncExternalStore(subscribe, () => preference, () => "light");
  return { theme: selected, setThemePreference, toggleTheme };
};
