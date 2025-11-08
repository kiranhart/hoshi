'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function DarkModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Apply theme class directly to HTML element as fallback
    useEffect(() => {
        if (!mounted || typeof window === 'undefined') return;
        
        const currentTheme = resolvedTheme || theme;
        const html = document.documentElement;
        
        // Normalize theme to lowercase
        const normalizedTheme = String(currentTheme).toLowerCase();
        
        if (normalizedTheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [theme, resolvedTheme, mounted]);

    // Determine if we're in dark mode - use resolvedTheme if available, otherwise check document
    const isDark = mounted && (resolvedTheme === 'dark' || (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')));

    const toggleTheme = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!mounted || !setTheme) return;
        
        // Get current effective theme - normalize to lowercase
        let currentTheme = theme === 'system' 
            ? (resolvedTheme || 'light')
            : (theme || resolvedTheme || 'light');
        
        // Normalize to lowercase to handle any case issues
        currentTheme = String(currentTheme).toLowerCase();
        
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Manually apply the class FIRST for immediate visual feedback
        if (typeof window !== 'undefined') {
            const html = document.documentElement;
            if (newTheme === 'dark') {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
            // Also update localStorage directly
            localStorage.setItem('medilink-theme', newTheme);
        }
        
        // Then set theme via next-themes
        setTheme(newTheme);
    };

    if (!mounted) {
        return (
            <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-all hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Toggle dark mode"
                disabled
            >
                <Sun className="h-4 w-4" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-all hover:bg-gradient-to-r hover:from-rose-50 hover:via-pink-50 hover:to-rose-50 hover:text-rose-700 dark:text-gray-300 dark:hover:from-rose-950/50 dark:hover:via-pink-950/50 dark:hover:to-rose-950/50 dark:hover:text-rose-400"
            aria-label="Toggle dark mode"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}

