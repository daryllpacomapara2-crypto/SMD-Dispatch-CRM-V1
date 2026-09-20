import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showSubtitle = true }) => {
  const iconHeight = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const iconWidth = Math.round(iconHeight * 1.5);

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG: Perspective Highway + 3 Golden Skyscrapers */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 160 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>

        {/* 3 Golden Pillars / Equalizer Skyscrapers */}
        {/* Pillar 1 (Left, Short) */}
        <path
          d="M25 50 C25 46, 32 46, 32 50 L32 90 L18 90 L18 55 C18 50, 25 50, 25 50 Z"
          fill="url(#goldGradient)"
        />
        {/* Pillar 2 (Middle, Medium) */}
        <path
          d="M48 28 C48 24, 57 24, 57 28 L57 85 L39 85 L39 34 C39 28, 48 28, 48 28 Z"
          fill="url(#goldGradient)"
        />
        {/* Pillar 3 (Right, Tallest) */}
        <path
          d="M75 10 C75 5, 87 5, 87 10 L87 88 L65 88 L65 18 C65 10, 75 10, 75 10 Z"
          fill="url(#goldGradient)"
        />

        {/* Perspective Highway Outline */}
        <path
          d="M0 102 L65 72 L87 72 L115 102 Z"
          fill="url(#roadGradient)"
          opacity="0.95"
        />

        {/* Highway Road Surface & Center Dashes */}
        <polygon points="4,101 64,74 72,74 110,101" fill="#1C1917" />

        {/* Dashed Center Yellow Dividing Lines */}
        <line x1="68" y1="75" x2="68" y2="79" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="67" y1="82" x2="66" y2="88" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
        <line x1="65" y1="92" x2="64" y2="100" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />

        {/* Road Base Leading Arc */}
        <path
          d="M0 102 L65 72 L87 72"
          stroke="#F59E0B"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      {/* Brand Text */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-black tracking-tight text-amber-500 uppercase font-sans ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'
            }`}
          >
            Sound Minded
          </span>
          <span
            className={`font-bold text-amber-600/90 text-xs px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20`}
          >
            LLC
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-amber-500 font-bold uppercase tracking-[0.22em] text-[9px] -mt-0.5 leading-tight ${
              size === 'sm' ? 'text-[8px] tracking-[0.18em]' : ''
            }`}
          >
            D I S P A T C H I N G
          </span>
        )}
      </div>
    </div>
  );
};
