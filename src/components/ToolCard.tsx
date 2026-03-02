
"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ExternalLink, LayoutDashboard, Plus, Check } from "lucide-react";
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
    
    // Stay on current page while updating selection
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <CardHeader className="p-0 relative h-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white group-hover:scale-110 transition-transform duration-500">
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-2">
          <Button 
            variant={isInComparison ? "default" : "secondary"} 
            size="icon" 
            className={`h-8 w-8 rounded-full shadow-lg transition-all ${isInComparison ? 'bg-primary scale-110 text-white hover:bg-primary/90' : 'bg-white/80 backdrop-blur-sm hover:bg-white'}`}
            onClick={toggleCompare}
            title={isInComparison ? "Remove from comparison" : "Add to comparison"}
          >
            {isInComparison ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
          <Badge variant={tool.pricingModel === 'Free' ? 'secondary' : 'default'} className="bg-white/80 backdrop-blur-sm text-foreground hover:bg-white border-none text-[10px] font-bold">
            {tool.pricingModel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/tool/${tool.slug}`} className="block">
            <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
              {tool.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-current" />
            {tool.rating}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
          {tool.tagline}
        </p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tool.workCategories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="outline" className="text-[10px] font-medium py-0 px-2 border-primary/20 text-primary/80">
              {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 flex gap-2">
        <Button variant="secondary" size="sm" className="w-full gap-2 text-xs" asChild>
          <Link href={`/tool/${tool.slug}`}>
            View Details
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 border-primary/10 hover:bg-primary hover:text-white transition-colors" asChild>
          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
