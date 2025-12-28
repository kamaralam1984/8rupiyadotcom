'use client';

import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check if dark class is already set (from initial script)
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        setTheme('dark');
      } else {
        setTheme('light');
        applyTheme('light');
      }
    }

    // Listen for theme changes from other instances or context
    const handleThemeChange = (e: CustomEvent) => {
      const newTheme = e.detail as 'light' | 'dark';
      if (newTheme !== theme) {
        setTheme(newTheme);
      }
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    
    // Also watch for DOM changes (if theme is changed elsewhere)
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const currentDark = root.classList.contains('dark');
      const currentLight = root.classList.contains('light');
      if (currentDark && theme !== 'dark') {
        setTheme('dark');
      } else if (currentLight && theme !== 'light') {
        setTheme('light');
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
      observer.disconnect();
    };
  }, [theme]);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    try {
      const root = window.document.documentElement;
      
      // Remove all theme classes
      root.classList.remove('light', 'dark');
      root.removeAttribute('data-theme');
      
      // Add dark class if needed (simple toggle approach)
      if (newTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Force reflow to ensure styles are applied
      void root.offsetHeight;
      
      // Dispatch custom event for context listeners
      window.dispatchEvent(new CustomEvent('themechange', { detail: newTheme }));
    } catch (e) {
      console.error('Failed to apply theme:', e);
    }
  };

  if (!mounted) {
    // Return a placeholder to prevent layout shift
    return (
      <button
        className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 w-10 h-10 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Simple toggle between light and dark
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    
    // Update state and apply theme immediately
    setTheme(nextTheme);
    applyTheme(nextTheme);
    
    // Force reflow to ensure styles are applied
    requestAnimationFrame(() => {
      document.body.offsetHeight; // Force reflow
      window.dispatchEvent(new Event('resize'));
    });
  };

  const getIcon = () => {
    return theme === 'dark' ? <FiMoon /> : <FiSun />;
  };

  const getLabel = () => {
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      type="button"
      className="p-3 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-xl border-2 border-gray-300 dark:border-gray-600 w-12 h-12 flex items-center justify-center cursor-pointer"
      aria-label={`Toggle theme (Current: ${getLabel()})`}
      title={`Theme: ${getLabel()} - Click to toggle`}
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-gray-700 dark:text-gray-200"
      >
        {getIcon()}
      </motion.div>
    </motion.button>
  );
}

