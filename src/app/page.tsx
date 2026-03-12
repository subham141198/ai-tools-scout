"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PROFESSIONS, getTrendingTools } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeleton } from "@/components/ToolCardSkeleton";
import { AdPlacement } from "@/components/AdPlacement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  TrendingUp, 
  LayoutGrid, 
  Search as SearchIcon, 
  Sparkles, 
  SlidersHorizontal,
  ChevronDown,
  Star,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Loader2
} from "lucide-react";
import { aiSearch } from "@/ai/flows/ai-search-flow";
import { aiTrendingTools } from "@/ai/flows/ai-trending-tools-flow";
import { AITool } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams } from "next/navigation";
import { useFirestore } from "@/firebase";
import { AinexaLogo } from "@/components/AinexaLogo";

export default function HomePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const db = useFirestore();

  const [trendingTools, setTrendingTools] = useState<AITool[]>([]);
  const [searchResults, setSearchResults] = useState<AITool[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [navigatingProfessionId, setNavigatingProfessionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrending() {
      setIsTrendingLoading(true);
      try {
        const dbTools = await getTrendingTools(db);
        if (!dbTools || dbTools.length === 0 || dbTools[0].id === 't1') {
          const aiResult = await aiTrendingTools();
          const tools = aiResult.tools.map(t => ({
            ...t,
            slug: t.id,
            createdAt: new Date().toISOString(),
            featured: true,
            approved: true
          })) as AITool[];
          setTrendingTools(tools);
          setAiExplanation(aiResult.marketSummary);
        } else {
          setTrendingTools(dbTools);
        }
      } catch (error) {
        console.error("Error loading trending tools:", error);
      } finally {
        setIsTrendingLoading(false);
      }
    }
    loadTrending();
  }, [db]);

  useEffect(() => {
    async function handleSearch() {
      if (!q) {
        setSearchResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const aiResult = await aiSearch({ query: q });
        const results = aiResult.recommendedTools.map(tool => ({
          ...tool,
          slug: tool.id,
          createdAt: new Date().toISOString(),
          featured: false,
          approved: true,
          logoUrl: tool.logoUrl || `https://picsum.photos/seed/${tool.id}/200/200`
        })) as AITool[];
        
        setSearchResults(results);
        setAiExplanation(aiResult.aiExplanation);
      } catch (error) {
        console.error("AI Search Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    handleSearch();
  }, [q]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {!q && (
          <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#0ea5e9]/5 via-background to-background border-b">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-40">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0ea5e9]/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#7c3aed]/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 shadow-sm border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                Next-Gen AI Intelligence Platform
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter mb-8 max-w-5xl mx-auto leading-none">
                Unlock the Power of <span className="brand-text-gradient italic">Intelligence</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Ainexa maps the global AI ecosystem to provide you with curated tools that elevate your specific workflow to superhuman levels.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button size="lg" className="rounded-full h-14 px-10 font-bold text-lg bg-primary shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" asChild>
                  <Link href="#trending">Explore Directory</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-14 px-10 font-bold text-lg bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5" asChild>
                  <Link href="/compare">Compare Engine</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4">
          {q ? (
            <div className="py-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-primary font-bold uppercase tracking-wider">
                    <SearchIcon className="h-4 w-4" />
                    Search Results
                  </div>
                  <h1 className="text-2xl font-headline font-black">
                    Ainexa Intelligence for <span className="brand-text-gradient italic">"{q}"</span>
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    {isLoading ? "Consulting Global Scout..." : `Found ${searchResults?.length || 0} tools matching your global query`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-64 shrink-0 space-y-8 hidden lg:block">
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground/70">
                      <SlidersHorizontal className="h-4 w-4" />
                      Refine Search
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-sm font-black">Pricing Model</p>
                        <div className="space-y-2">
                          {['Free', 'Freemium', 'Paid'].map(price => (
                            <label key={price} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors group">
                              <input type="checkbox" className="rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4" />
                              <span className="font-medium group-hover:font-bold">{price}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <p className="text-sm font-black">Quick Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {PROFESSIONS.slice(0, 8).map(prof => (
                            <Badge key={prof.id} variant="secondary" className="hover:bg-primary hover:text-white transition-colors cursor-pointer bg-muted/50 text-[10px] font-bold py-1 px-3 rounded-full" asChild>
                              <Link href={`/profession/${prof.slug}`}>{prof.name}</Link>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <AdPlacement type="sidebar" slot="6062113214" />
                </aside>

                <div className="flex-1 space-y-8">
                  {isLoading ? (
                    <div className="space-y-8">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-center animate-pulse">
                         <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                         <p className="text-sm font-bold text-primary italic">Ainexa is scanning global models for your request...</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <ToolCardSkeleton key={i} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {aiExplanation && (
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex gap-6 items-start animate-in fade-in slide-in-from-top-4 shadow-sm">
                          <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                            <Sparkles className="h-7 w-7 text-white" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-black text-xs text-primary uppercase tracking-widest">Ainexa Market Insights</h4>
                            <p className="text-foreground leading-relaxed italic font-medium text-lg">
                              "{aiExplanation}"
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {searchResults && searchResults.length > 0 ? (
                          searchResults.map(tool => (
                            <ToolCard key={tool.id} tool={tool} />
                          ))
                        ) : (
                          <div className="col-span-full py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                              <SearchIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-bold text-xl">No tools matched your criteria</p>
                              <p className="text-muted-foreground max-w-sm mx-auto">
                                Try refining your search or explore our curated profession categories.
                              </p>
                            </div>
                            <Button asChild className="rounded-full px-8">
                              <Link href="/">Reset Search</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <AdPlacement type="banner" slot="6062113214" className="my-12" />

              <section id="trending" className="py-16">
                <div className="flex items-center justify-between mb-12 pb-6 border-b">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-headline font-black flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      Featured Tools
                    </h2>
                    <p className="text-muted-foreground text-lg">High-performance AI solutions curated by Ainexa.</p>
                  </div>
                </div>

                {isTrendingLoading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                     {[1, 2, 3, 4, 5, 6].map((i) => (
                       <ToolCardSkeleton key={i} />
                     ))}
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {trendingTools.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}
              </section>

              <section className="py-24 bg-muted/30 -mx-4 px-4 rounded-[4rem] border border-primary/10 mb-20">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-headline font-black mb-6 leading-tight">Elite Tools for <span className="brand-text-gradient italic">Your Career</span></h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto text-xl font-medium">
                    Every profession is being transformed. We've mapped the top 1% of AI intelligence specifically for your professional domain.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
                  {PROFESSIONS.map(prof => (
                    <Link 
                      key={prof.id} 
                      href={`/profession/${prof.slug}`}
                      onClick={() => setNavigatingProfessionId(prof.id)}
                      className="group p-10 rounded-[2.5rem] bg-background border hover:border-primary hover:shadow-2xl transition-all text-center space-y-6 hover:-translate-y-2 duration-300 relative overflow-hidden"
                    >
                      {navigatingProfessionId === prof.id ? (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                          <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                      ) : null}
                      <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto group-hover:brand-gradient group-hover:text-white transition-all duration-300 shadow-sm">
                        <LayoutGrid className="h-10 w-10" />
                      </div>
                      <span className="font-black text-lg block uppercase tracking-tighter group-hover:text-primary transition-colors">{prof.name}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-card py-20 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-8">
            <Link href="/" className="group">
              <AinexaLogo />
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              Mapping global AI intelligence to empower professionals. Ainexa researches thousands of models so you can focus on creation.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link href="#" className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                <Github className="h-6 w-6" />
              </Link>
              <Link href="#" className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase text-sm tracking-widest mb-8 text-primary/70">Intelligence</h4>
            <ul className="space-y-4 text-base font-bold text-muted-foreground">
              <li><Link href="/compare" className="hover:text-primary transition-colors">Comparison Tool</Link></li>
              <li><Link href="/submit-tool" className="hover:text-primary transition-colors">List Your Platform</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Moderation</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy & Data</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-sm tracking-widest mb-8 text-primary/70">Top Domains</h4>
            <ul className="space-y-4 text-base font-bold text-muted-foreground">
              {PROFESSIONS.slice(0, 4).map(p => (
                <li key={p.id}><Link href={`/profession/${p.slug}`} className="hover:text-primary transition-colors">{p.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
            <h4 className="font-black uppercase text-sm tracking-widest mb-6">Ainexa Insider</h4>
            <p className="text-base text-muted-foreground mb-8 font-medium">Get the latest AI breakthroughs delivered to your inbox.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-background border rounded-full px-6 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button className="rounded-full px-8 h-12 shadow-lg">Join</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-10 border-t text-center text-xs font-black uppercase tracking-widest text-muted-foreground/50">
          &copy; {new Date().getFullYear()} Ainexa Intelligence System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
