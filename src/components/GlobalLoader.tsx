"use client";

import { Loader2, Sparkles } from "lucide-react";

interface GlobalLoaderProps {
  title?: string;
  message?: string;
}

export function GlobalLoader({ 
  title = "Scout Intelligence is Working", 
  message = "Scanning 10,000+ global AI models and mapping capabilities..." 
}: GlobalLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-12 space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
        <div className="relative z-10 w-24 h-24 bg-card border-4 border-primary/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <div className="absolute -top-3 -right-3 h-8 w-8 bg-accent rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-2xl font-headline font-black tracking-tight text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
