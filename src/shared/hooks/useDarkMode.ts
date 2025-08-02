import { useEffect, useState } from "react";

export default function UseDarkMode() {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('star-sailors-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
        
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    const toggleDarkMode = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        
        // Save to localStorage
        localStorage.setItem('star-sailors-theme', newTheme ? 'dark' : 'light');
        
        // Apply to document
        document.documentElement.classList.toggle('dark', newTheme);
    };

    return { isDark, toggleDarkMode };
};