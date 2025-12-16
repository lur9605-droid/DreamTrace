import React from 'react';

const Logo = ({ width = 40, height = 40, className = '' }: { width?: number; height?: number; className?: string }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 80" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB385" /> {/* Soft Peach */}
          <stop offset="50%" stopColor="#B39DDB" /> {/* Gentle Purple */}
          <stop offset="100%" stopColor="#6495ED" /> {/* Calming Blue */}
        </linearGradient>
      </defs>
      
      {/* 
        Refined Design based on "Dream Trace":
        1. A soft arc (Trace) wrapping around a crescent moon.
        2. Small star points for lightness.
        3. Simple, plenty of whitespace, gentle curves.
      */}

      {/* Crescent Moon: Thinner, elegant curve */}
      <path 
        d="M45,15 C30,25 25,50 35,65 C45,80 70,70 85,60" 
        stroke="url(#logoGradient)" 
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dream Trace: A gentle wave intersecting the moon, representing the journey */}
      <path 
        d="M20,55 C35,45 55,45 70,55 C80,62 90,55 95,45" 
        stroke="url(#logoGradient)" 
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />

      {/* Main Star: Four-pointed, slightly offset */}
      <path 
        d="M65,25 Q65,30 70,30 Q65,30 65,35 Q65,30 60,30 Q65,30 65,25" 
        stroke="url(#logoGradient)" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tiny Distant Star (Dot) for balance */}
      <circle cx="80" cy="20" r="1.5" fill="url(#logoGradient)" opacity="0.6" />
    </svg>
  );
};

export default Logo;
