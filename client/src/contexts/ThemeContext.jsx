import { createContext, useContext, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

const darkColors = {
  bg: '#0a0b0f',
  bgCard: '#141519',
  bgCardHover: '#1a1b21',
  bgSidebar: '#0e0f14',
  border: '#1e2028',
  borderLight: '#282a33',
  text: '#f5f5f7',
  textSecondary: '#86868b',
  textTertiary: '#6e6e73',
  accent: '#6366f1',
  accentLight: '#818cf8',
  positive: '#34d399',
  negative: '#f87171',
  chartGrid: '#1e2028',
};

const lightColors = {
  bg: '#f5f5f7',
  bgCard: '#ffffff',
  bgCardHover: '#fafafa',
  bgSidebar: '#ffffff',
  border: '#e5e5ea',
  borderLight: '#f2f2f7',
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textTertiary: '#86868b',
  accent: '#6366f1',
  accentLight: '#818cf8',
  positive: '#22c55e',
  negative: '#ef4444',
  chartGrid: '#e5e5ea',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const colors = theme === 'light' ? lightColors : darkColors;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    // Apply transition class
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [theme]);

  const value = { theme, toggleTheme, colors };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback for components outside provider
    return { theme: 'dark', toggleTheme: () => {}, colors: darkColors };
  }
  return ctx;
}
