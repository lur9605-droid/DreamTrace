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
        <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFA07A" /> {/* Light Salmon/Orange */}
          <stop offset="50%" stopColor="#A893FF" /> {/* Purple */}
          <stop offset="100%" stopColor="#4D5BCE" /> {/* Blue */}
        </linearGradient>
      </defs>
      
      {/* Crescent Moon Shape merging into waves */}
      <path 
        d="M20,60 C10,55 5,45 15,30 C25,15 45,5 60,15 C50,15 35,25 30,40 C25,55 35,65 50,70 C65,75 80,65 90,75 C80,85 60,85 45,80 C30,75 25,65 20,60 Z" 
        stroke="url(#logoGradient)" 
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Additional Wave Line */}
      <path 
        d="M25,68 C40,80 70,80 95,65" 
        stroke="url(#logoGradient)" 
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4-Pointed Star */}
      <path 
        d="M65,25 L68,35 L78,38 L68,41 L65,51 L62,41 L52,38 L62,35 Z" 
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
