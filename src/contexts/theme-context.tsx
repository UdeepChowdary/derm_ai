'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  
  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Determine if we're in dark mode
  const isDarkMode = resolvedTheme === 'dark';

  const value = {
    theme: (theme as Theme) || 'system',
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    isDarkMode,
    toggleTheme,
    isMounted,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
