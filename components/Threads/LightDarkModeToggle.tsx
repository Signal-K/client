import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import cn from 'classnames';

const LightDarkModeToggle = (): JSX.Element | null => {
    const [isMounted, setIsMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) return null;

    const switchTheme = (): void => {
        if (isMounted) {
            setTheme(theme === 'light' ? 'dark' : 'light');
        }
    };

    return (
        <button aria-label='Toggle Dark Mode' onClick={switchTheme} className='p-1 focus-ring'>
            <svg
                fill='none'
                viewBox='0 0 24 24'
                width='24'
                height='24'
                stroke='currentColor'
                className="transition-colors text-black dark:text-white"
            >
                {theme === 'light' ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth='1.5'
                        d=''
                    ></path>
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth='1.5'
                        d=''
                    ></path>
                )}
            </svg>
        </button>
    );
};

export default LightDarkModeToggle;