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
        <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFA07A" /> {/* Orange/Peach at Bottom-Left */}
          <stop offset="50%" stopColor="#A893FF" /> {/* Purple in Middle */}
          <stop offset="100%" stopColor="#4D5BCE" /> {/* Blue at Top-Right */}
        </linearGradient>
      </defs>
      
      {/* Outer Line: Starts top, curves wide left, sweeps to bottom wave */}
      <path 
        d="M50,10 C25,20 15,50 25,65 C35,80 65,70 90,80" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Line: Starts top, curves inner left, sweeps to top wave */}
      <path 
        d="M50,10 C38,30 38,50 48,60 C58,70 78,60 90,68" 
        stroke="url(#logoGradient)" 
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4-Pointed Star with concave sides */}
      <path 
        d="M65,30 Q65,40 75,40 Q65,40 65,50 Q65,40 55,40 Q65,40 65,30" 
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
