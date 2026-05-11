import {
  createContext,
  useContext,
  useEffect,
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.classList.remove("light", "dark");
      root.classList.add(systemDark ? "dark" : "light");
      root.setAttribute(
        "data-theme",
        systemDark ? "dark" : "light"
      );
    };

    applyTheme();

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}