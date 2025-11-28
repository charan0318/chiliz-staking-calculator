import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for the user's selected theme ('light', 'dark', 'system')
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      try {
        return (localStorage.getItem('theme') as Theme) || 'system';
      } catch {
        return 'system';
      }
    }
    return 'system';
  });

  // State for the OS-level color scheme preference
  const [prefersDarkMode, setPrefersDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect to listen for changes in the OS-level preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Effect to persist theme selection to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to persist theme preference:", e);
    }
  }, [theme]);

  // Determine if dark mode is active based on theme and OS preference
  const isDarkMode = useMemo(() => {
    if (theme === 'system') {
      return prefersDarkMode;
    }
    return theme === 'dark';
  }, [theme, prefersDarkMode]);

  // Effect to apply the 'dark' class to the <html> element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    isDarkMode
  }), [theme, isDarkMode]);


  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};