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
          <stop offset="0%" stopColor="#FFA07A" /> {/* Peach/Orange */}
          <stop offset="50%" stopColor="#A893FF" /> {/* Purple */}
          <stop offset="100%" stopColor="#4D5BCE" /> {/* Blue */}
        </linearGradient>
      </defs>
      
      {/* 
        Outer Curve: 
        Starts at top tip (48, 15), 
        Curves out left to form moon back, 
        Sweeps down and right into the bottom wave 
      */}
      <path 
        d="M48,15 C25,25 15,55 30,70 C45,85 70,65 95,80" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* 
        Inner Curve: 
        Starts at top tip (48, 15), 
        Curves inner left to form moon crescent, 
        Sweeps right into the top wave (parallel to bottom)
      */}
      <path 
        d="M48,15 C38,35 38,55 50,62 C62,69 80,62 92,70" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4-Pointed Star (Sparkle) */}
      <path 
        d="M68,35 Q68,42 75,42 Q68,42 68,49 Q68,42 61,42 Q68,42 68,35" 
        stroke="url(#logoGradient)" 
        strokeWidth="3" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Logo;
