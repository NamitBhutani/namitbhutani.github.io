import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Sync state with DOM on mount
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Apply class
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // Save preference
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "light" ? (
        <HugeiconsIcon icon={Sun03Icon} size={20} className="transition-all" />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} size={20} className="transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
