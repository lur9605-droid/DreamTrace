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
         Refined paths to match the reference:
         1. Outer Moon Line curving into top wave
         2. Inner Moon Line
         3. Bottom Wave Line
         4. Star
      */}

      {/* Outer Moon Curve -> Top Wave */}
      <path 
        d="M38,12 C20,18 10,40 22,65 C35,90 65,55 90,75" 
        stroke="url(#logoGradient)" 
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Moon Curve */}
      <path 
        d="M38,12 C28,30 28,50 45,60" 
        stroke="url(#logoGradient)" 
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bottom Wave Line */}
      <path 
        d="M25,72 C40,85 70,55 95,80" 
        stroke="url(#logoGradient)" 
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Star */}
      <path 
        d="M55,35 L58,42 L65,45 L58,48 L55,55 L52,48 L45,45 L52,42 Z" 
        stroke="url(#logoGradient)" 
        strokeWidth="3" 
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Logo;
