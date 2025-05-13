import { useTheme } from "@/lib/theme";

export function useDarkMode() {
  const { theme, setTheme } = useTheme();
  
  const isDarkMode = theme === "dark";
  
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };
  
  return {
    isDarkMode,
    toggleDarkMode
  };
}
