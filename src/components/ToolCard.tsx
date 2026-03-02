import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AITool } from "@/lib/types";
import { Button } from "./ui/button";

interface ToolCardProps {
  tool: AITool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <CardHeader className="p-0 relative h-32 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-white">
            <Image
              src={tool.logoUrl}
              alt={tool.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={tool.pricingModel === 'Free' ? 'secondary' : 'default'} className="bg-white/80 backdrop-blur-sm text-foreground hover:bg-white border-none text-[10px] font-bold">
            {tool.pricingModel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {tool.name}
          </h3>
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
        <Button variant="outline" size="icon" className="shrink-0 h-9 w-9" asChild>
          <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}