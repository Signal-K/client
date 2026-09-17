import { useEffect, useState } from "react";

export default function UseDarkMode() {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const root = window.document.documentElement;
        const dark = localStorage.getItem("theme") === "dark";

        root.classList.toggle("dark", dark);
        setIsDark(dark)
    }, []);

    const toggleDarkMode = () => {
    const root = window.document.documentElement;
    const isCurrentlyDark = root.classList.contains("dark");

    root.classList.toggle("dark", !isCurrentlyDark);
    localStorage.setItem("theme", !isCurrentlyDark ? "dark" : "light");
    setIsDark(!isCurrentlyDark);
  };

  return { isDark, toggleDarkMode };
};