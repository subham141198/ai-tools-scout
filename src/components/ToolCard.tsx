"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ExternalLink, Plus, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AITool } from "@/lib/types";
import { Button } from "./ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ToolCardProps {
  tool: AITool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentTools = searchParams.get('tools')?.split(',').filter(Boolean) || [];
  const isInComparison = currentTools.includes(tool.slug);
  const [isNavigating, setIsNavigating] = useState(false);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let newTools;
    if (isInComparison) {
      newTools = currentTools.filter(t => t !== tool.slug);
    } else {
      newTools = [...currentTools, tool.slug];
    }
    
    const params = new URLSearchParams(searchParams.toString());
    if (newTools.length > 0) {
      params.set('tools', newTools.join(','));
    } else {
      params.delete('tools');
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleProfileClick = () => {
    setIsNavigating(true);
  };

  return (
    <Card className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-card rounded-[1.5rem] sm:rounded-[2rem] flex flex-col h-full relative">
      <CardHeader className="p-0 relative h-36 sm:h-40 bg-muted/20 group-hover:bg-primary/5 transition-colors duration-500">
        <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] overflow-hidden border-4 border-white shadow-xl bg-white group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500 ease-out">
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
          {tool.featured && (
            <Badge className="bg-amber-500 text-white border-none text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
              Editor's Choice
            </Badge>
          )}
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-primary border-none text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm w-fit">
            {tool.pricingModel}
          </Badge>
        </div>

        {/* Compare Toggle */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <Button 
            variant={isInComparison ? "default" : "secondary"} 
            size="icon" 
            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 ${isInComparison ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110'}`}
            onClick={toggleCompare}
          >
            {isInComparison ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
          <Link href={`/tool/${tool.slug}`} onClick={handleProfileClick} className="block group/link flex-1 min-w-0">
            <h3 className="font-headline font-black text-lg sm:text-xl leading-tight group-hover/link:text-primary transition-colors truncate tracking-tight">
              {tool.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black bg-amber-50 text-amber-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-amber-100 shadow-sm shrink-0">
            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
            {tool.rating}
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[32px] sm:min-h-[40px] mb-3 sm:mb-4 font-medium leading-relaxed">
          {tool.tagline}
        </p>
        
        <div className="mt-auto flex flex-wrap gap-1.5 sm:gap-2">
          {tool.workCategories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 bg-muted/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md border border-muted-foreground/10 group-hover:border-primary/20 group-hover:text-primary/60 transition-colors">
              {cat.replace('-', ' ')}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:p-6 pt-0 flex gap-2 sm:gap-3">
        <Button 
          className="flex-1 rounded-xl sm:rounded-2xl font-bold gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:-translate-y-0.5 h-10 sm:h-11 text-xs sm:text-sm" 
          disabled={isNavigating}
          onClick={handleProfileClick}
          asChild
        >
          <Link href={`/tool/${tool.slug}`}>
            {isNavigating ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : "Profile"}
            {!isNavigating && <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border-primary/10 hover:bg-primary hover:text-white transition-all hover:scale-105" asChild title="Visit Official Site">
          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
