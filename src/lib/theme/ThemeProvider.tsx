import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode, Theme, createTheme, combinedCSSVariables, RadixColorName, RadixColorStep, AlphaColorName, RadixCSSVariable } from './theme';

interface ThemeContextType {
    theme: Theme;
    setTheme: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: ThemeMode;
    storageKey?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'light',
    storageKey = 'theme-mode'
}: ThemeProviderProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        // Try to get theme from localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }

            // Check system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return defaultTheme;
    });

    const theme = createTheme(themeMode);

    const setTheme = (mode: ThemeMode) => {
        setThemeMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, mode);
        }
    };

    const toggleTheme = () => {
        setTheme(themeMode === 'light' ? 'dark' : 'light');
    };

    // Apply CSS custom properties to document root
    useEffect(() => {
        const root = document.documentElement;
        const variables = combinedCSSVariables[themeMode];

        // Remove existing theme classes
        root.classList.remove('light', 'dark');
        // Add current theme class
        root.classList.add(themeMode);

        // Apply CSS custom properties (includes both theme and Radix colors)
        Object.entries(variables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }, [themeMode]);

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            // Only auto-switch if no manual preference is stored
            const stored = localStorage.getItem(storageKey);
            if (!stored) {
                setThemeMode(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [storageKey]);

    const value: ThemeContextType = {
        theme,
        setTheme,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Hook to get a Radix color (automatically switches with theme)
export function useRadixColor<T extends RadixColorName>(
    scale: T,
    step: RadixColorStep
): RadixCSSVariable<T, RadixColorStep> {
    // CSS variable names are automatically set by the theme provider
    return `var(--${scale}-${step})` as RadixCSSVariable<T, RadixColorStep>;
}

// Hook to get alpha color (for transparency effects)
export function useRadixAlphaColor<T extends AlphaColorName>(
    scale: T,
    step: RadixColorStep
): RadixCSSVariable<`${T}-a`, RadixColorStep> {
    return `var(--${scale}-a${step})` as RadixCSSVariable<`${T}-a`, RadixColorStep>;
}

// Hook to get overlay color (black/white alpha)
export function useOverlayColor<T extends 'black' | 'white'>(
    variant: T,
    step: RadixColorStep
): RadixCSSVariable<`${T}-a`, RadixColorStep> {
    return `var(--${variant}-a${step})` as RadixCSSVariable<`${T}-a`, RadixColorStep>;
}
