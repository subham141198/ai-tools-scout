"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { getToolBySlug } from "@/lib/db";
import { AITool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, Star, Plus, Loader2, Trash2, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdPlacement } from "@/components/AdPlacement";
import { aiToolDetails } from "@/ai/flows/ai-tool-details-flow";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadTools() {
      setIsLoading(true);
      const slugs = searchParams.get('tools')?.split(',').filter(Boolean) || [];
      
      const loadedTools: AITool[] = [];
      
      for (const slug of slugs) {
        // Try local DB first
        let tool = await getToolBySlug(slug);
        
        // If not found, try AI research
        if (!tool) {
          try {
            const aiResult = await aiToolDetails({ slug });
            tool = {
              ...aiResult,
              id: slug,
              slug: slug,
              featured: false,
              approved: true,
              createdAt: new Date().toISOString(),
            } as AITool;
          } catch (error) {
            console.error(`Failed to fetch AI details for ${slug}:`, error);
          }
        }
        
        if (tool) loadedTools.push(tool);
      }
      
      setSelectedTools(loadedTools);
      setIsLoading(false);
    }
    
    loadTools();
  }, [searchParams]);

  const removeTool = (slug: string) => {
    const newTools = selectedTools.filter(t => t.slug !== slug);
    setSelectedTools(newTools);
    
    // Update URL to reflect changes
    const params = new URLSearchParams(window.location.search);
    params.set('tools', newTools.map(t => t.slug).join(','));
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-black mb-4 tracking-tight">
            Comparison <span className="text-primary italic">Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Make informed decisions by comparing features, pricing, and capabilities of leading AI solutions side-by-side.
          </p>
        </div>

        <AdPlacement type="banner" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse font-medium">Gemini is researching and comparing tools...</p>
          </div>
        ) : selectedTools.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-dashed p-20 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No tools selected for comparison</h2>
              <p className="text-muted-foreground">Search for tools or browse the directory to add them here.</p>
            </div>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/">Search Global AI Directory</Link>
            </Button>
          </div>
        ) : (
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
             <div className="relative overflow-x-auto pb-8 bg-card rounded-[2rem] shadow-2xl border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="p-8 text-left w-64 bg-card sticky left-0 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="text-xs uppercase tracking-widest font-black text-muted-foreground">Product Details</div>
                    </th>
                    {selectedTools.map(tool => (
                      <th key={tool.slug} className="p-8 min-w-[320px] text-center border-r last:border-r-0">
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white group-hover:scale-105 transition-transform">
                            <Image src={tool.logoUrl} alt={tool.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-headline font-black text-xl tracking-tight">{tool.name}</h3>
                            <div className="flex items-center justify-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full" onClick={() => removeTool(tool.slug)}>
                                <Trash2 className="h-3 w-3 mr-1" />
                                Remove
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 text-xs rounded-full" asChild>
                                <Link href={`/tool/${tool.slug}`}>Details</Link>
                              </Button>
                            </div>
                          </div>
                          <Button size="lg" className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20" asChild>
                            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">Visit Official Site</a>
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Pricing Model</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <span className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full">{tool.pricingModel}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Scout Rating</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex items-center justify-center gap-1.5 font-black text-lg text-amber-500">
                          <Star className="h-5 w-5 fill-current" />
                          {tool.rating}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top">Core Features</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 border-r last:border-r-0">
                        <ul className="space-y-3">
                          {tool.features.map((f, i) => (
                            <li key={i} className="flex gap-3 items-start text-xs font-medium leading-relaxed">
                              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top">Key Advantages</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 border-r last:border-r-0">
                        <ul className="space-y-2">
                          {tool.pros.slice(0, 4).map((p, i) => (
                            <li key={i} className="text-emerald-700 text-xs flex gap-2 items-center bg-emerald-50 p-2 rounded-lg font-medium">
                              <Check className="h-3 w-3 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top">Best For</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {tool.professionCategories.map(p => (
                            <span key={p} className="text-[10px] bg-secondary font-bold text-secondary-foreground px-3 py-1 rounded-lg uppercase tracking-wider">{p.replace('-', ' ')}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-muted/10">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Intelligence Type</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground">
                          {tool.id === tool.slug ? (
                            <><Globe className="h-3 w-3" /> Global AI Model</>
                          ) : (
                            <><Check className="h-3 w-3" /> Scout Verified</>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-16">
          <AdPlacement type="responsive" />
        </div>
      </main>
    </div>
  );
}
