import { Moon, Sun } from "lucide-react";
import { useTheme } from "./themeStore";

const ThemeControl = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
};

export default ThemeControl;
