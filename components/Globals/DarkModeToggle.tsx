import { useEffect, useState } from "react";

export const useDarkMode = (): [boolean, () => void] => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        setIsDarkMode(savedMode === 'true');
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('darkMode', String(newMode));
        document.documentElement.classList.toggle('dark', newMode);
    };

    return [isDarkMode, toggleDarkMode];
}