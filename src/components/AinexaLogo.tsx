"use client";

import { cn } from "@/lib/utils";

interface AinexaLogoProps {
  className?: string;
  showText?: boolean;
}

export function AinexaLogo({ className, showText = true }: AinexaLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-10 h-10">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="ainexa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          
          {/* Main "A" Path */}
          <path
            d="M50 15L85 85H70L50 45L30 85H15L50 15Z"
            fill="url(#ainexa-gradient)"
          />
          
          {/* Connection Nodes (Circles) */}
          <circle cx="50" cy="15" r="6" fill="white" className="drop-shadow-sm" />
          <circle cx="15" cy="85" r="6" fill="white" className="drop-shadow-sm" />
          <circle cx="85" cy="85" r="6" fill="white" className="drop-shadow-sm" />
          
          {/* Crossbar Nodes */}
          <circle cx="40" cy="65" r="5" fill="white" fillOpacity="0.9" />
          <circle cx="60" cy="65" r="5" fill="white" fillOpacity="0.9" />
          
          {/* Inner connecting line for the crossbar nodes */}
          <path 
            d="M40 65H60" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeOpacity="0.6"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-headline font-black text-2xl tracking-tighter text-slate-900">
          Ainexa
        </span>
      )}
    </div>
  );
}
