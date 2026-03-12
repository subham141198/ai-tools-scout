"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { getToolBySlug } from "@/lib/db";
import { AITool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, Star, Plus, Loader2, Trash2, Globe, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdPlacement } from "@/components/AdPlacement";
import { aiToolDetails } from "@/ai/flows/ai-tool-details-flow";
import { Input } from "@/components/ui/input";
import { GlobalLoader } from "@/components/GlobalLoader";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newToolInput, setNewToolInput] = useState("");
  
  const toolsParam = searchParams.get('tools') || "";
  const slugs = useMemo(() => toolsParam.split(',').filter(Boolean), [toolsParam]);

  useEffect(() => {
    async function loadTools() {
      if (slugs.length === 0) {
        setSelectedTools([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      const toolPromises = slugs.map(async (slug) => {
        let tool = await getToolBySlug(slug);
        
        if (!tool) {
          try {
            const aiResult = await aiToolDetails({ slug });
            return {
              ...aiResult,
              id: slug,
              slug: slug,
              featured: false,
              approved: true,
              createdAt: new Date().toISOString(),
            } as AITool;
          } catch (error) {
            console.error(`Failed to fetch AI details for ${slug}:`, error);
            return null;
          }
        }
        return tool;
      });

      const results = await Promise.all(toolPromises);
      setSelectedTools(results.filter((t): t is AITool => t !== null));
      setIsLoading(false);
    }
    
    loadTools();
  }, [slugs]);

  const removeTool = (slug: string) => {
    const newSlugs = slugs.filter(s => s !== slug);
    const params = new URLSearchParams(searchParams.toString());
    if (newSlugs.length > 0) {
      params.set('tools', newSlugs.join(','));
    } else {
      params.delete('tools');
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const handleAddTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolInput.trim()) return;
    
    const slug = newToolInput.toLowerCase().replace(/\s+/g, '-');
    if (slugs.includes(slug)) {
      setNewToolInput("");
      return;
    }

    const newSlugs = [...slugs, slug];
    const params = new URLSearchParams(searchParams.toString());
    params.set('tools', newSlugs.join(','));
    setNewToolInput("");
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-headline font-black mb-4 tracking-tight">
            Comparison <span className="text-primary italic">Engine</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Compare features, pricing, and capabilities of any AI tools in the world side-by-side.
          </p>
          
          <form onSubmit={handleAddTool} className="relative max-w-md mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Add tool name (e.g. Claude, Jasper)..." 
                  className="rounded-full h-12 pl-11 bg-card border-2 border-primary/10 focus-visible:border-primary transition-all"
                  value={newToolInput}
                  onChange={(e) => setNewToolInput(e.target.value)}
                />
              </div>
              <Button type="submit" className="rounded-full h-12 px-6 bg-primary font-bold shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </form>
        </div>

        <AdPlacement type="banner" slot="6062113214" />

        {isLoading && selectedTools.length === 0 ? (
          <div className="py-24">
            <GlobalLoader 
              title="Building Comparison Matrix" 
              message="Cross-referencing global pricing models and feature sets across multiple models..."
            />
          </div>
        ) : selectedTools.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-dashed p-20 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your comparison table is empty</h2>
              <p className="text-muted-foreground">Type a tool name above or find tools in the directory to begin.</p>
            </div>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/">Back to Global Search</Link>
            </Button>
          </div>
        ) : (
          <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[2rem] blur-xl opacity-25"></div>
             <div className="relative overflow-x-auto pb-8 bg-card rounded-[2rem] shadow-2xl border-2 border-primary/5">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="p-8 text-left w-64 bg-card sticky left-0 z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="text-xs uppercase tracking-widest font-black text-muted-foreground">Analysis Matrix</div>
                    </th>
                    {selectedTools.map(tool => (
                      <th key={tool.slug} className="p-8 min-w-[320px] text-center border-r last:border-r-0 relative group/col">
                        <button 
                          onClick={() => removeTool(tool.slug)}
                          className="absolute top-4 right-4 p-2 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover/col:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                          title="Remove from comparison"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col items-center gap-6">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white group-hover:scale-110 transition-transform duration-300">
                            <Image src={tool.logoUrl} alt={tool.name} fill className="object-cover" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-headline font-black text-xl tracking-tight">{tool.name}</h3>
                            <Button variant="outline" size="sm" className="h-8 text-xs rounded-full border-primary/20 hover:bg-primary/5" asChild>
                              <Link href={`/tool/${tool.slug}`}>View Profile</Link>
                            </Button>
                          </div>
                          <Button size="lg" className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" asChild>
                            <a href={tool.websiteUrl} target="_blank" rel="noopener noreferrer">Visit Website</a>
                          </Button>
                        </div>
                      </th>
                    ))}
                    {isLoading && (
                      <th className="p-8 min-w-[320px] text-center bg-muted/10 animate-pulse border-dashed border-2">
                         <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="font-bold text-sm italic">Fetching Next Tool Data...</span>
                         </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-t hover:bg-primary/5 transition-colors group/row">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Pricing Model</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <span className="font-black text-primary bg-primary/10 px-4 py-1.5 rounded-full text-xs uppercase tracking-tighter">{tool.pricingModel}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Scout Rating</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex items-center justify-center gap-1.5 font-black text-xl text-amber-500">
                          <Star className="h-5 w-5 fill-current" />
                          {tool.rating}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors align-top">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Core Features</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 border-r last:border-r-0">
                        <ul className="space-y-3">
                          {tool.features.map((f, i) => (
                            <li key={i} className="flex gap-3 items-start text-xs font-medium leading-relaxed">
                              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5 bg-emerald-50 rounded-full p-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors align-top">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Advantages</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 border-r last:border-r-0">
                        <ul className="space-y-2">
                          {tool.pros.slice(0, 4).map((p, i) => (
                            <li key={i} className="text-emerald-700 text-[11px] flex gap-2 items-center bg-emerald-50/50 p-2.5 rounded-xl font-bold border border-emerald-100">
                              <Check className="h-3 w-3 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t hover:bg-primary/5 transition-colors align-top">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Professional Use</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {tool.professionCategories.map(p => (
                            <span key={p} className="text-[9px] bg-secondary font-black text-primary px-2.5 py-1 rounded-full uppercase tracking-widest">{p.replace('-', ' ')}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t bg-muted/10">
                    <td className="p-6 font-bold sticky left-0 bg-card z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Source</td>
                    {selectedTools.map(tool => (
                      <td key={tool.slug} className="p-6 text-center border-r last:border-r-0">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {tool.id === tool.slug ? (
                            <><Globe className="h-3 w-3" /> Global Intelligence</>
                          ) : (
                            <><Check className="h-3 w-3" /> Verified Entry</>
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
