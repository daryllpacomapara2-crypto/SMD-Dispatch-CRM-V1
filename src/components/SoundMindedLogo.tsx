import React from 'react';

interface SoundMindedLogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  color?: string;
  height?: number | string;
  width?: number | string;
}

export const SoundMindedLogo: React.FC<SoundMindedLogoProps> = ({
  className = 'h-10 w-auto',
  variant = 'full',
  color = '#EBB31B',
  height,
  width,
}) => {
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 380 310"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ height, width }}
        aria-label="Sound Minded Dispatching Emblem"
      >
        <defs>
          <clipPath id="iconRoadCut">
            <path d="M 0,0 L 380,0 L 380,310 L 380,310 L 205,170 L 20,310 Z" />
          </clipPath>
        </defs>

        {/* 3 Pillars */}
        <g clipPath="url(#iconRoadCut)">
          {/* Bar 1 (Shortest, Left) */}
          <path d="M 108,310 L 108,185 C 108,155 120,140 148,130 L 152,128 L 152,310 Z" fill={color} />
          
          {/* Bar 2 (Middle) */}
          <path d="M 180,310 L 180,95 C 180,65 192,50 220,40 L 225,38 L 225,310 Z" fill={color} />
          
          {/* Bar 3 (Tallest, Right) */}
          <path d="M 252,310 L 252,30 C 252,10 264,2 292,-5 L 298,-7 L 298,310 Z" fill={color} />
        </g>

        {/* Highway Left Edge */}
        <polygon points="20,310 44,310 205,170 200,170" fill={color} />

        {/* Highway Right Edge */}
        <polygon points="356,310 380,310 210,170 205,170" fill={color} />

        {/* Highway Center Dashes */}
        <polygon points="203,174 207,174 207.3,180 202.7,180" fill={color} />
        <polygon points="202.4,185 207.6,185 208,194 202,194" fill={color} />
        <polygon points="201.2,201 208.8,201 209.6,214 200.4,214" fill={color} />
        <polygon points="199.5,222 210.5,222 212,240 198,240" fill={color} />
        <polygon points="196.5,250 213.5,250 216,274 194,274" fill={color} />
        <polygon points="192,285 218,285 221,310 189,310" fill={color} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 1020 310"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height, width }}
      aria-label="Sound Minded Dispatching, LLC"
    >
      <defs>
        <clipPath id="fullRoadCut">
          <path d="M 0,0 L 1020,0 L 1020,310 L 380,310 L 205,170 L 20,310 Z" />
        </clipPath>
      </defs>

      {/* 3 Pillars */}
      <g clipPath="url(#fullRoadCut)">
        {/* Bar 1 (Shortest, Left) */}
        <path d="M 108,310 L 108,185 C 108,155 120,140 148,130 L 152,128 L 152,310 Z" fill={color} />
        
        {/* Bar 2 (Middle) */}
        <path d="M 180,310 L 180,95 C 180,65 192,50 220,40 L 225,38 L 225,310 Z" fill={color} />
        
        {/* Bar 3 (Tallest, Right) */}
        <path d="M 252,310 L 252,30 C 252,10 264,2 292,-5 L 298,-7 L 298,310 Z" fill={color} />
      </g>

      {/* Highway Left Edge */}
      <polygon points="20,310 44,310 205,170 200,170" fill={color} />

      {/* Highway Right Edge */}
      <polygon points="356,310 380,310 210,170 205,170" fill={color} />

      {/* Highway Center Dashes */}
      <polygon points="203,174 207,174 207.3,180 202.7,180" fill={color} />
      <polygon points="202.4,185 207.6,185 208,194 202,194" fill={color} />
      <polygon points="201.2,201 208.8,201 209.6,214 200.4,214" fill={color} />
      <polygon points="199.5,222 210.5,222 212,240 198,240" fill={color} />
      <polygon points="196.5,250 213.5,250 216,274 194,274" fill={color} />
      <polygon points="192,285 218,285 221,310 189,310" fill={color} />

      {/* Text: SOUND MINDED */}
      <text
        x="340"
        y="198"
        fill={color}
        style={{
          fontFamily: "'Oswald', 'Impact', 'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: '154px',
          letterSpacing: '2.5px',
        }}
      >
        SOUND MINDED
      </text>

      {/* Text: DISPATCHING */}
      <text
        x="346"
        y="272"
        fill={color}
        style={{
          fontFamily: "'Oswald', 'Impact', 'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: '41px',
          letterSpacing: '23px',
        }}
      >
        DISPATCHING
      </text>
    </svg>
  );
};
