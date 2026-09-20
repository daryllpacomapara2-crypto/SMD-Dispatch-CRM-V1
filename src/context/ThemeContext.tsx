import React, { createContext, useContext, useState, useEffect } from 'react';

export type PortalTheme = 'dark' | 'light' | 'midnight' | 'warm-light';

export interface ThemeOption {
  id: PortalTheme;
  name: string;
  category: 'light' | 'dark';
  description: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  textHex: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    name: 'Daylight Logistics',
    category: 'light',
    description: 'Crisp, high-contrast light theme for bright dispatch rooms and daylight hours.',
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    accentHex: '#d97706',
    textHex: '#0f172a',
  },
  {
    id: 'warm-light',
    name: 'Warm Sand Paper',
    category: 'light',
    description: 'Soft warm white and desert cream to reduce glare and eye strain.',
    bgHex: '#fbf9f5',
    cardHex: '#ffffff',
    accentHex: '#b45309',
    textHex: '#1c1917',
  },
  {
    id: 'dark',
    name: 'Executive Charcoal (Default)',
    category: 'dark',
    description: 'Classic trucking night dispatch interface with amber freight accents.',
    bgHex: '#0c0a09',
    cardHex: '#1c1917',
    accentHex: '#f59e0b',
    textHex: '#f5f5f4',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue Highway',
    category: 'dark',
    description: 'Deep highway navy blue cockpit for evening monitoring and overnight dispatches.',
    bgHex: '#070b14',
    cardHex: '#0f172a',
    accentHex: '#38bdf8',
    textHex: '#f8fafc',
  },
];

interface ThemeContextType {
  theme: PortalTheme;
  setTheme: (theme: PortalTheme) => void;
  isDarkMode: boolean;
  isLightMode: boolean;
  activeThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'sound_minded_portal_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<PortalTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as PortalTheme;
      if (saved && ['dark', 'light', 'midnight', 'warm-light'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error('Error reading theme from storage', e);
    }
    return 'dark'; // Default to classic trucking dark
  });

  const setTheme = (newTheme: PortalTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('portal-theme-changed', { detail: newTheme }));
    } catch (e) {
      console.error('Error saving theme to storage', e);
    }
  };

  // Apply theme class and data-theme to root html element and body
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Manage class names
    root.classList.remove('theme-dark', 'theme-light', 'theme-midnight', 'theme-warm-light', 'dark', 'light');
    root.classList.add(`theme-${theme}`);
    
    if (theme === 'light' || theme === 'warm-light') {
      root.classList.add('light');
    } else {
      root.classList.add('dark');
    }

    // Set meta theme-color for browser chrome
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[2];
    themeColorMeta.content = currentOption.bgHex;
  }, [theme]);

  // Listen for storage events across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const val = e.newValue as PortalTheme;
        if (['dark', 'light', 'midnight', 'warm-light'].includes(val)) {
          setThemeState(val);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isDarkMode = theme === 'dark' || theme === 'midnight';
  const isLightMode = theme === 'light' || theme === 'warm-light';
  const activeThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[2];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        isLightMode,
        activeThemeOption,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
