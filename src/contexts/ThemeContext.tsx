'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setThemeState(savedTheme);
    } else {
      // Default to light if no saved theme
      setThemeState('light');
      localStorage.setItem('theme', 'light');
    }
    setMounted(true);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    // Remove existing theme classes and data attributes
    root.classList.remove('light', 'dark');
    root.removeAttribute('data-theme');
    
    // Add current theme class
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    
    // Force color-scheme property
    root.style.colorScheme = theme;
  }, [theme, mounted]);

  // Listen for theme changes from ThemeToggle (when used outside context)
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail as 'light' | 'dark';
      if (newTheme !== theme) {
        setThemeState(newTheme);
      }
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, [theme]);

  // Save theme to localStorage when it changes
  const setTheme = (newTheme: Theme) => {
    try {
      // Update state first - this will trigger the useEffect
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
      
      // Immediately apply theme to DOM for instant feedback
      const root = window.document.documentElement;
      
      // Force remove and add theme classes immediately
      root.classList.remove('light', 'dark');
      root.removeAttribute('data-theme');
      root.classList.add(newTheme);
      root.setAttribute('data-theme', newTheme);
      root.style.colorScheme = newTheme;
      
      // Force a repaint to ensure changes are visible
      void root.offsetHeight;
    } catch (e) {
      console.error('Failed to save theme:', e);
    }
  };

  // Prevent flash of wrong theme on mount
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

