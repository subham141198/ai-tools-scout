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
        // First try Firestore
        const dbTools = await getTrendingTools(db);
        
        // If Firestore has no featured tools (fresh project), consult AI
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
          <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
                <TrendingUp className="h-3 w-3" />
                Global AI Intelligence Discovery
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                Scout the Best AI Tools <span className="text-primary italic">in the World</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
                Our AI scans the entire global software landscape to find the perfect tools for your specific workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="rounded-full h-12 px-8 font-bold text-base bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                  <Link href="#trending">Browse Directory</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 font-bold text-base bg-background/50 backdrop-blur-sm" asChild>
                  <Link href="/compare">Comparison Engine</Link>
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
                  <h1 className="text-3xl font-headline font-black">
                    AI Solutions for <span className="text-primary italic">"{q}"</span>
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    {isLoading ? "Consulting Global Intelligence..." : `Found ${searchResults?.length || 0} tools matching your global query`}
                  </p>
                </div>
                {!isLoading && (
                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="rounded-full h-10 px-5 gap-2 font-semibold">
                          Sort by: Top Rated
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Top Rated</DropdownMenuItem>
                        <DropdownMenuItem>Newest</DropdownMenuItem>
                        <DropdownMenuItem>Popular</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
                      <Link href="/">Clear All</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col lg:flex-row gap-10">
                <aside className="lg:w-64 shrink-0 space-y-8 hidden lg:block">
                  <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground/70">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </h4>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-sm font-black">Pricing Model</p>
                        <div className="space-y-2">
                          {['Free', 'Freemium', 'Paid', 'Open Source'].map(price => (
                            <label key={price} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors group">
                              <input type="checkbox" className="rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4" />
                              <span className="font-medium group-hover:font-bold">{price}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-black">Rating</p>
                        <div className="space-y-2">
                          {[4, 3, 2].map(rate => (
                            <label key={rate} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors group">
                              <input type="checkbox" className="rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4" />
                              <span className="flex items-center gap-1 font-medium group-hover:font-bold">
                                {rate}+ <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <p className="text-sm font-black">Explore Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {PROFESSIONS.slice(0, 8).map(prof => (
                            <Badge key={prof.id} variant="secondary" className="hover:bg-primary hover:text-white transition-colors cursor-pointer bg-muted/50 text-[10px] font-bold py-1 px-3 rounded-full uppercase" asChild>
                              <Link href={`/profession/${prof.slug}`}>{prof.name}</Link>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <AdPlacement type="sidebar" />
                </aside>

                <div className="flex-1 space-y-8">
                  {isLoading ? (
                    <div className="space-y-8">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-center animate-pulse">
                         <Loader2 className="h-6 w-6 animate-spin text-primary shrink-0" />
                         <p className="text-sm font-bold text-primary italic">Consulting Scout Intelligence: Mapping global AI models for your specific request...</p>
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
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                              Gemini Market Analysis
                            </h4>
                            <p className="text-foreground leading-relaxed italic text-sm md:text-base">
                              "{aiExplanation}"
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                              <p className="font-bold text-xl">No tools found for your query</p>
                              <p className="text-muted-foreground max-w-sm mx-auto">
                                Our AI intelligence couldn't find a perfect match. Try broadening your search or exploring by role.
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
                  
                  <AdPlacement type="responsive" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <AdPlacement type="banner" className="my-12" />

              <section id="trending" className="py-12">
                <div className="flex items-center justify-between mb-8 pb-4 border-b">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-headline font-bold flex items-center gap-2">
                      <TrendingUp className="h-7 w-7 text-primary" />
                      Featured AI Tools
                    </h2>
                    <p className="text-muted-foreground">High-performance tools recommended by our global AI researcher.</p>
                  </div>
                </div>

                {isTrendingLoading ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                     {[1, 2, 3, 4, 5, 6].map((i) => (
                       <ToolCardSkeleton key={i} />
                     ))}
                   </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trendingTools.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                )}
              </section>

              <AdPlacement type="responsive" className="my-12" />

              <section className="py-16 bg-muted/30 -mx-4 px-4 rounded-[3rem] border">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-headline font-black mb-4">Discover Your <span className="text-primary italic">Secret Weapons</span></h2>
                  <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                    Every profession has elite AI tools. We've categorized the world's best intelligence for your specific role.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
                  {PROFESSIONS.map(prof => (
                    <Link 
                      key={prof.id} 
                      href={`/profession/${prof.slug}`}
                      onClick={() => setNavigatingProfessionId(prof.id)}
                      className="group p-8 rounded-3xl bg-background border hover:border-primary hover:shadow-2xl transition-all text-center space-y-4 hover:-translate-y-1 duration-300 relative overflow-hidden"
                    >
                      {navigatingProfessionId === prof.id ? (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-primary">Researching...</span>
                        </div>
                      ) : null}
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
                        <LayoutGrid className="h-8 w-8" />
                      </div>
                      <span className="font-black text-sm block uppercase tracking-tighter">{prof.name}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <AdPlacement type="banner" className="my-12" />
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-card py-16 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">
                TS
              </div>
              <span className="font-headline font-bold text-xl tracking-tight">
                AI Tool <span className="text-primary">Scout</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              Global intelligence for professional AI discovery. We research thousands of tools so you don't have to.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase text-xs tracking-widest mb-6">Directory</h4>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              <li><Link href="/compare" className="hover:text-primary transition-colors">Comparison Engine</Link></li>
              <li><Link href="/submit-tool" className="hover:text-primary transition-colors">List Your Tool</Link></li>
              <li><Link href="/admin" className="hover:text-primary transition-colors">Moderator Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-xs tracking-widest mb-6">Popular Roles</h4>
            <ul className="space-y-3 text-sm font-medium text-muted-foreground">
              {PROFESSIONS.slice(0, 4).map(p => (
                <li key={p.id}><Link href={`/profession/${p.slug}`} className="hover:text-primary transition-colors">{p.name}</Link></li>
              ))}
            </ul>
          </div>

          <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
            <h4 className="font-black uppercase text-xs tracking-widest mb-4">Stay Ahead</h4>
            <p className="text-sm text-muted-foreground mb-6 font-medium">The AI world moves fast. Join our newsletter.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-background border rounded-full px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <Button className="rounded-full px-6">Join</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          &copy; {new Date().getFullYear()} AI Tool Scout. Powered by Gemini Pro Intelligence.
        </div>
      </footer>
    </div>
  );
}
