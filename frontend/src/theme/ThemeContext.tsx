import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, lightTheme, darkTheme } from './theme';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('spooldb-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // Default to light mode
    return 'light';
  });

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Apply theme to document root for CSS variables
    document.documentElement.style.setProperty('--color-primary', theme.colors.primary.main);
    document.documentElement.style.setProperty('--color-primary-hover', theme.colors.primary.hover);
    document.documentElement.style.setProperty('--color-primary-pressed', theme.colors.primary.pressed);
    document.documentElement.style.setProperty('--color-background', theme.colors.background);
    document.documentElement.style.setProperty('--color-surface', theme.colors.surface);
    document.documentElement.style.setProperty('--color-elevated', theme.colors.elevated || theme.colors.surface);
    document.documentElement.style.setProperty('--color-border', theme.colors.border);
    document.documentElement.style.setProperty('--color-text-primary', theme.colors.text.primary);
    document.documentElement.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    document.documentElement.style.setProperty('--color-success', theme.colors.status.success);
    document.documentElement.style.setProperty('--color-warning', theme.colors.status.warning);
    document.documentElement.style.setProperty('--color-danger', theme.colors.status.danger);
    document.documentElement.style.setProperty('--color-info', theme.colors.status.info);
    document.documentElement.style.setProperty('--font-family', theme.typography.fontFamily);
    document.documentElement.style.setProperty('--border-radius-small', theme.borderRadius.small);
    document.documentElement.style.setProperty('--border-radius-medium', theme.borderRadius.medium);
    document.documentElement.style.setProperty('--border-radius-large', theme.borderRadius.large);
    document.documentElement.style.setProperty('--transition-fast', theme.transitions.fast);
    document.documentElement.style.setProperty('--transition-medium', theme.transitions.medium);
    document.documentElement.style.setProperty('--transition-slow', theme.transitions.slow);
    
    // Set background color on body
    document.body.style.backgroundColor = theme.colors.background;
    document.body.style.color = theme.colors.text.primary;
    document.body.style.fontFamily = theme.typography.fontFamily;
  }, [theme]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('spooldb-theme', newMode);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('spooldb-theme', newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

