"use client";

import { cn } from "@/lib/utils";

interface AinexaLogoProps {
  className?: string;
  showText?: boolean;
}

export function AinexaLogo({ className }: AinexaLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <span className="text-2xl font-black tracking-tighter brand-text-gradient">
        Ainexa
      </span>
    </div>
  );
}
