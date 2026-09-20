import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check, 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  SunMedium, 
  Monitor, 
  X 
} from 'lucide-react';
import { 
  THEME_OPTIONS, 
  ThemeOption, 
  ThemeMode, 
  getSavedTheme, 
  applyTheme 
} from '../utils/themeManager';

interface ThemePortalProps {
  className?: string;
}

export const ThemePortal: React.FC<ThemePortalProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(getSavedTheme);
  const [activeTabMode, setActiveTabMode] = useState<ThemeMode>(() => getSavedTheme().category);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial application of saved theme
    const saved = getSavedTheme();
    setCurrentTheme(saved);
    setActiveTabMode(saved.category);
    applyTheme(saved);

    const handleThemeEvent = (e: any) => {
      if (e.detail?.theme) {
        setCurrentTheme(e.detail.theme);
        setActiveTabMode(e.detail.theme.category);
      }
    };

    window.addEventListener('sm-theme-change', handleThemeEvent);
    return () => window.removeEventListener('sm-theme-change', handleThemeEvent);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (theme: ThemeOption) => {
    setCurrentTheme(theme);
    setActiveTabMode(theme.category);
    applyTheme(theme);
  };

  const handleQuickToggleMode = (targetMode: ThemeMode) => {
    setActiveTabMode(targetMode);
    // Find first or best matching theme in that mode
    const match = THEME_OPTIONS.find(t => t.category === targetMode);
    if (match) {
      handleSelectTheme(match);
    }
  };

  const darkThemes = THEME_OPTIONS.filter(t => t.category === 'dark');
  const lightThemes = THEME_OPTIONS.filter(t => t.category === 'light');

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Theme Portal Trigger Button */}
      <button
        id="btn-theme-portal"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Theme Portal: Select Light or Dark Color Theme"
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer shadow-sm border ${
          isOpen
            ? 'bg-orange-500 text-white border-orange-400 ring-2 ring-orange-400/30'
            : currentTheme.category === 'light'
            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {currentTheme.category === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-orange-400" />
          )}
          <Palette className="w-3.5 h-3.5 opacity-80" />
        </div>
        
        <span className="font-bold tracking-tight">Theme Portal</span>

        {/* Selected Theme Badge */}
        <span className={`hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          currentTheme.category === 'light'
            ? 'bg-amber-100 text-amber-900 border-amber-300'
            : 'bg-zinc-900 text-orange-300 border-zinc-700'
        }`}>
          {currentTheme.name.split(' ')[0]}
        </span>

        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Theme Portal Dropdown Modal Menu */}
      {isOpen && (
        <div 
          id="dropdown-theme-portal"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#121214] border border-zinc-700 shadow-2xl z-50 overflow-hidden text-zinc-200 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  Theme Portal
                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded border border-orange-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">Choose your preferred light or dark dispatching workspace</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close theme portal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Mode Toggle Pill: Light vs Dark */}
          <div className="p-3 bg-[#141417] border-b border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2 bg-[#0e0e10] p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                id="btn-mode-dark"
                onClick={() => handleQuickToggleMode('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabMode === 'dark'
                    ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-orange-400" />
                <span>🌙 Dark Themes</span>
                <span className="text-[10px] opacity-70 bg-zinc-700/50 px-1.5 py-0.2 rounded-full">
                  {darkThemes.length}
                </span>
              </button>

              <button
                type="button"
                id="btn-mode-light"
                onClick={() => handleQuickToggleMode('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTabMode === 'light'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-300'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>☀️ Light Themes</span>
                <span className="text-[10px] opacity-70 bg-zinc-700/50 px-1.5 py-0.2 rounded-full">
                  {lightThemes.length}
                </span>
              </button>
            </div>
          </div>

          {/* Theme Options List */}
          <div className="max-h-[340px] overflow-y-auto p-3 space-y-2 scrollbar-thin">
            <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <span>{activeTabMode === 'dark' ? 'Dark Color Schemes' : 'Light Color Schemes'}</span>
              <span className="text-[10px] text-zinc-500">Auto-saved to preferences</span>
            </div>

            {(activeTabMode === 'dark' ? darkThemes : lightThemes).map(theme => {
              const isSelected = currentTheme.id === theme.id;
              return (
                <button
                  key={theme.id}
                  id={`theme-option-${theme.id}`}
                  type="button"
                  onClick={() => handleSelectTheme(theme)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-orange-950/30 border-orange-500/80 shadow-md ring-1 ring-orange-500/40'
                      : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Palette Color Swatch Preview */}
                    <div 
                      className="w-10 h-10 rounded-lg p-1 shrink-0 flex flex-col justify-between border shadow-inner overflow-hidden"
                      style={{ 
                        backgroundColor: theme.previewColors.bg,
                        borderColor: theme.previewColors.border 
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: theme.previewColors.accent }} 
                        />
                        <div 
                          className="w-2 h-2 rounded-sm opacity-60" 
                          style={{ backgroundColor: theme.previewColors.text }} 
                        />
                      </div>
                      <div 
                        className="w-full h-2.5 rounded-xs" 
                        style={{ backgroundColor: theme.previewColors.card, border: `1px solid ${theme.previewColors.border}` }} 
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold truncate ${
                          isSelected ? 'text-orange-400' : 'text-zinc-100 group-hover:text-white'
                        }`}>
                          {theme.name}
                        </span>
                        {theme.badge && (
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                            isSelected 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {theme.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5 leading-tight">
                        {theme.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-zinc-700 group-hover:border-zinc-500 flex items-center justify-center transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Quick Summary */}
          <div className="px-4 py-2.5 bg-[#141417] border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-orange-400" />
              Active: <strong className="text-zinc-200">{currentTheme.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleSelectTheme(THEME_OPTIONS[0])}
              className="text-xs text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
            >
              Reset Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
