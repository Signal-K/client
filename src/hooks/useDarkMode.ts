import { useEffect, useState } from "react";

export default function useDarkMode() {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        let savedTheme: string | null = null;
        try {
            savedTheme = localStorage.getItem('star-sailors-theme');
        } catch {
            // localStorage unavailable (e.g. Safari private mode)
        }
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    const toggleDarkMode = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);

        try {
            localStorage.setItem('star-sailors-theme', newTheme ? 'dark' : 'light');
        } catch {
            // localStorage unavailable (e.g. Safari private mode)
        }

        document.documentElement.classList.toggle('dark', newTheme);
    };

    return { isDark, toggleDarkMode };
};