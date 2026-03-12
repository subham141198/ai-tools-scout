"use client";

import { cn } from "@/lib/utils";

interface AinexaLogoProps {
  className?: string;
  showText?: boolean;
}

export function AinexaLogo({ className, showText = true }: AinexaLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
        {/* Stylized A shape with nodes */}
        <path
          d="M50 15L85 85H70L50 45L30 85H15L50 15Z"
          fill="url(#logo-gradient)"
        />
        {/* Nodes from the logo */}
        <circle cx="50" cy="15" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="30" cy="85" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="70" cy="85" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="40" cy="65" r="5" fill="white" fillOpacity="0.8" />
        <circle cx="60" cy="65" r="5" fill="white" fillOpacity="0.8" />
        {/* Connecting lines (implied by the node look) */}
        <path d="M40 65H60" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
      </svg>
      {showText && (
        <span className="font-headline font-black text-2xl tracking-tighter text-[#1e293b]">
          Ainexa
        </span>
      )}
    </div>
  );
}
