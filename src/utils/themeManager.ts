export type ThemeMode = 'dark' | 'light';

export interface ThemeOption {
  id: string;
  name: string;
  category: ThemeMode;
  tagline: string;
  badge?: string;
  previewColors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    border: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  // Dark Themes
  {
    id: 'midnight-dark',
    name: 'Midnight Dispatcher',
    category: 'dark',
    tagline: 'Deep obsidian night with high-visibility dispatch amber (Default)',
    badge: 'Original',
    previewColors: {
      bg: '#0a0a0b',
      card: '#121214',
      accent: '#f97316',
      text: '#f4f4f5',
      border: '#27272a'
    }
  },
  {
    id: 'slate-dark',
    name: 'Cool Slate Logistics',
    category: 'dark',
    tagline: 'Deep navy charcoal with vibrant cyan and steel blue accents',
    badge: 'Modern',
    previewColors: {
      bg: '#0b1329',
      card: '#111e3b',
      accent: '#38bdf8',
      text: '#e2e8f0',
      border: '#1e293b'
    }
  },
  {
    id: 'emerald-dark',
    name: 'Freight Emerald',
    category: 'dark',
    tagline: 'Deep pine night with high-contrast emerald green highlights',
    badge: 'Pro',
    previewColors: {
      bg: '#051814',
      card: '#0c2720',
      accent: '#10b981',
      text: '#ecfdf5',
      border: '#134e4a'
    }
  },
  {
    id: 'carbon-dark',
    name: 'Obsidian Carbon',
    category: 'dark',
    tagline: 'Pure OLED black contrast optimized for low-light cab dispatching',
    badge: 'OLED',
    previewColors: {
      bg: '#000000',
      card: '#0d0d0e',
      accent: '#fbbf24',
      text: '#ffffff',
      border: '#222225'
    }
  },

  // Light Themes
  {
    id: 'clean-light',
    name: 'Clean Dispatch Light',
    category: 'light',
    tagline: 'Crisp, high-contrast daylight office paper with orange branding',
    badge: 'Popular',
    previewColors: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#f97316',
      text: '#0f172a',
      border: '#e2e8f0'
    }
  },
  {
    id: 'executive-light',
    name: 'Executive Fleet Light',
    category: 'light',
    tagline: 'Cool corporate gray-blue with deep navy typography & teal accents',
    badge: 'Corporate',
    previewColors: {
      bg: '#f1f5f9',
      card: '#ffffff',
      accent: '#0284c7',
      text: '#0f172a',
      border: '#cbd5e1'
    }
  },
  {
    id: 'warm-sand-light',
    name: 'Warm Stone Logistics',
    category: 'light',
    tagline: 'Subtle warm neutral stone with rich charcoal typography & amber',
    badge: 'Soft',
    previewColors: {
      bg: '#fafaf9',
      card: '#ffffff',
      accent: '#d97706',
      text: '#1c1917',
      border: '#e7e5e4'
    }
  },
  {
    id: 'pure-white-light',
    name: 'High-Contrast In-Cab Light',
    category: 'light',
    tagline: 'Maximum sunlight readability with crisp high-definition borders',
    badge: 'Sunlight',
    previewColors: {
      bg: '#ffffff',
      card: '#f4f4f5',
      accent: '#ea580c',
      text: '#000000',
      border: '#cbd5e1'
    }
  }
];

const THEME_STORAGE_KEY = 'sm_dispatch_theme_preference';

export const getSavedTheme = (): ThemeOption => {
  if (typeof window === 'undefined') return THEME_OPTIONS[0];
  try {
    const savedId = localStorage.getItem(THEME_STORAGE_KEY);
    const found = THEME_OPTIONS.find(t => t.id === savedId);
    if (found) return found;
  } catch (e) {
    console.warn('Could not read theme from storage', e);
  }
  return THEME_OPTIONS[0];
};

export const applyTheme = (theme: ThemeOption) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.setAttribute('data-theme-mode', theme.category);

  if (theme.category === 'light') {
    root.classList.add('light', 'light-mode');
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
    root.classList.remove('light', 'light-mode');
  }

  // Set CSS Variables for instant reactive styling
  root.style.setProperty('--theme-bg', theme.previewColors.bg);
  root.style.setProperty('--theme-card', theme.previewColors.card);
  root.style.setProperty('--theme-accent', theme.previewColors.accent);
  root.style.setProperty('--theme-text', theme.previewColors.text);
  root.style.setProperty('--theme-border', theme.previewColors.border);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch (e) {
    console.warn('Could not save theme to storage', e);
  }

  // Dispatch custom event for React components
  window.dispatchEvent(new CustomEvent('sm-theme-change', { detail: { theme } }));
};
