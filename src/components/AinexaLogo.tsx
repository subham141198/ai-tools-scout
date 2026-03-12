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
          
          {/* Stylised "A" Body inspired by the node network */}
          <path
            d="M50 15L85 85H70L50 45L30 85H15L50 15Z"
            fill="url(#ainexa-gradient)"
          />
          
          {/* Node connections from the image */}
          <circle cx="50" cy="15" r="5" fill="white" />
          <circle cx="22" cy="70" r="4" fill="white" />
          <circle cx="78" cy="70" r="4" fill="white" />
          <circle cx="40" cy="55" r="4" fill="white" />
          <circle cx="60" cy="55" r="4" fill="white" />
          
          {/* Connecting lines between nodes inside the A */}
          <path d="M50 15L40 55" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M50 15L60 55" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M40 55H60" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M40 55L22 70" stroke="white" strokeWidth="2" strokeOpacity="0.8" />
          <path d="M60 55L78 70" stroke="white" strokeWidth="2" strokeOpacity="0.8" />

          {/* Sparkle effect on the top right as seen in logo */}
          <path
            d="M75 15C75 15 78 22 85 22C78 22 75 29 75 29C75 29 72 22 65 22C72 22 75 15 75 15Z"
            fill="white"
            className="animate-pulse"
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
