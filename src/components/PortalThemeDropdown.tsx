import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme, PortalTheme, THEME_OPTIONS } from '../context/ThemeContext';

export const PortalThemeDropdown: React.FC = () => {
  const { theme, setTheme, isLightMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  const lightOptions = THEME_OPTIONS.filter((t) => t.category === 'light');
  const darkOptions = THEME_OPTIONS.filter((t) => t.category === 'dark');

  const handleSelectTheme = (themeId: PortalTheme) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Portal Theme Button */}
      <button
        type="button"
        id="portal-theme-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change portal color theme (Light / Dark)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
          isOpen
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/30'
            : isLightMode
            ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-amber-500/50'
            : 'bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-800 hover:border-amber-500/40 hover:text-amber-300'
        }`}
      >
        <span className="flex items-center justify-center w-4 h-4 text-amber-400">
          {isLightMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-amber-400" />}
        </span>
        <span className="font-medium">Portal Theme</span>
        <span
          className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
            isLightMode
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-stone-800 text-amber-300 border-stone-700'
          }`}
        >
          {isLightMode ? 'Light' : 'Dark'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="portal-theme-dropdown-menu"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-stone-900 border border-stone-700/80 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Palette className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Portal Theme</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h4>
                <p className="text-[11px] text-stone-400">Choose your preferred visual theme</p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-stone-400 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
              Saved
            </span>
          </div>

          {/* Quick Light / Dark Quick-Switch Tabs */}
          <div className="p-3 bg-stone-950/50 border-b border-stone-800">
            <div className="grid grid-cols-2 gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  isLightMode
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>☀️ Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  !isLightMode
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>🌙 Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Theme Palette Details */}
          <div className="p-3 max-h-[380px] overflow-y-auto space-y-3 divide-y divide-stone-800/60">
            {/* LIGHT THEMES SECTION */}
            <div className="space-y-1.5 pt-1 first:pt-0">
              <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                <Sun className="w-3 h-3" />
                <span>Light Theme Selections</span>
              </div>

              <div className="space-y-1.5">
                {lightOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectTheme(opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-stone-100 ring-1 ring-amber-500/30'
                          : 'bg-stone-900/40 hover:bg-stone-800/70 border-stone-800/80 text-stone-300 hover:text-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Swatch Preview */}
                        <div
                          className="w-10 h-10 rounded-lg flex flex-col justify-between p-1 border shadow-sm shrink-0"
                          style={{
                            backgroundColor: opt.bgHex,
                            borderColor: isSelected ? opt.accentHex : '#cbd5e1',
                          }}
                        >
                          <div
                            className="w-full h-3 rounded-sm flex items-center justify-between px-1"
                            style={{ backgroundColor: opt.cardHex }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: opt.accentHex }}
                            />
                            <span
                              className="w-4 h-1 rounded-sm"
                              style={{ backgroundColor: opt.textHex, opacity: 0.3 }}
                            />
                          </div>
                          <div
                            className="w-full h-2 rounded-sm"
                            style={{ backgroundColor: opt.cardHex, border: '1px solid #e2e8f0' }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-100">{opt.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1">{opt.description}</p>
                        </div>
                      </div>

                      {/* Checkmark */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'border border-stone-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DARK THEMES SECTION */}
            <div className="space-y-1.5 pt-3">
              <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                <Moon className="w-3 h-3" />
                <span>Dark Theme Selections</span>
              </div>

              <div className="space-y-1.5">
                {darkOptions.map((opt) => {
                  const isSelected = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectTheme(opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/50 text-stone-100 ring-1 ring-amber-500/30'
                          : 'bg-stone-900/40 hover:bg-stone-800/70 border-stone-800/80 text-stone-300 hover:text-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Swatch Preview */}
                        <div
                          className="w-10 h-10 rounded-lg flex flex-col justify-between p-1 border shadow-sm shrink-0"
                          style={{
                            backgroundColor: opt.bgHex,
                            borderColor: isSelected ? opt.accentHex : '#374151',
                          }}
                        >
                          <div
                            className="w-full h-3 rounded-sm flex items-center justify-between px-1"
                            style={{ backgroundColor: opt.cardHex }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: opt.accentHex }}
                            />
                            <span
                              className="w-4 h-1 rounded-sm"
                              style={{ backgroundColor: opt.textHex, opacity: 0.3 }}
                            />
                          </div>
                          <div
                            className="w-full h-2 rounded-sm"
                            style={{ backgroundColor: opt.cardHex, border: '1px solid #292524' }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-100">{opt.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-500/30">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 line-clamp-1">{opt.description}</p>
                        </div>
                      </div>

                      {/* Checkmark */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'border border-stone-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-4 py-2.5 bg-stone-950/90 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Theme auto-saves to your browser</span>
            <span className="text-amber-400/80 font-mono">Sound Minded CRM</span>
          </div>
        </div>
      )}
    </div>
  );
};
