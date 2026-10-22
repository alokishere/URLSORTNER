import { Monitor } from "lucide-react";
import { useTheme } from "./themeStore";

export default function ThemeControl() {
  const { preference, setThemePreference } = useTheme();
  return (
    <label className="theme-control focus-within:outline-2 focus-within:outline-offset-2" title="Choose color theme">
      <Monitor className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">Color theme</span>
      <select aria-label="Color theme" value={preference} onChange={(event) => setThemePreference(event.target.value)}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
