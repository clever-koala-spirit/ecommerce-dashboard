import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function ThemeToggle() {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
      document.body.style.backgroundColor = 'var(--color-bg-primary)';
    } else {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
      document.body.style.backgroundColor = 'var(--color-bg-primary)';
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-opacity-50 transition-colors"
      style={{
        background: 'rgba(99, 102, 241, 0.1)',
        color: 'var(--color-accent)',
      }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
