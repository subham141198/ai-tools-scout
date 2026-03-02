
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const searchParams = useSearchParams();
  const tools = searchParams.get('tools')?.split(',').filter(Boolean) || [];
  
  if (tools.length === 0) return null;

  const compareUrl = `/compare?tools=${tools.join(',')}`;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-primary text-primary-foreground rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-white/20 backdrop-blur-lg bg-primary/95">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">{tools.length} Tools Selected</p>
            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-wider font-black">Comparison Engine Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tools.length < 2 && (
             <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded-md hidden sm:block">
               Add 1 more to compare
             </span>
          )}
          <Button 
            asChild 
            size="sm" 
            variant="secondary" 
            className={cn(
              "rounded-xl font-bold px-6",
              tools.length < 2 && "opacity-50 pointer-events-none"
            )}
          >
            <Link href={compareUrl} className="flex items-center gap-2">
              Compare Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-white/10 rounded-lg"
            asChild
          >
            <Link href="/">
              <X className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
