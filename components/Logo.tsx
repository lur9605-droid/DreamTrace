import React from 'react';

const Logo = ({ width = 40, height = 40, className = '' }: { width?: number; height?: number; className?: string }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 120 100" 
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
        New Design based on user request:
        1. Crescent Moon on the left
        2. Four-pointed Star on the right
        3. Wavy lines below
      */}

      {/* Crescent Moon */}
      <path 
        d="M50,15 C25,25 20,60 40,80 C25,65 25,30 50,15 Z" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Four-pointed Star */}
      <path 
        d="M80,35 Q85,35 85,30 Q85,35 90,35 Q85,35 85,40 Q85,35 80,35" 
        stroke="url(#logoGradient)" 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Wavy Lines */}
      <path 
        d="M20,75 Q45,60 70,75 T110,85" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path 
        d="M35,85 Q55,75 75,85 T105,92" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
};

export default Logo;
