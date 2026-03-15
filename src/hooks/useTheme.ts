import UseDarkMode from "@/src/shared/hooks/useDarkMode";

/** Thin wrapper that maps useDarkMode's API to the legacy useTheme interface. */
export function useTheme() {
  const { isDark, toggleDarkMode } = UseDarkMode();
  return { isDark, toggleTheme: toggleDarkMode };
}
