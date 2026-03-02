import Link from "next/link";
import { PROFESSIONS, getTrendingTools } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { ToolCard } from "@/components/ToolCard";
import { AdPlacement } from "@/components/AdPlacement";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, LayoutGrid, Clock, Search as SearchIcon, Sparkles } from "lucide-react";
import { aiSearch } from "@/ai/flows/ai-search-flow";
import { AITool } from "@/lib/types";

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const { q } = await searchParams;
  const trendingTools = await getTrendingTools();
  
  let searchResults: AITool[] | null = null;
  let aiExplanation: string | null = null;

  if (q) {
    try {
      const aiResult = await aiSearch({ query: q });
      // Map AI results to AITool type for ToolCard compatibility
      searchResults = aiResult.recommendedTools.map(tool => ({
        ...tool,
        slug: tool.id, // Using generated ID as slug for search results
        createdAt: new Date().toISOString(),
        featured: false,
        approved: true,
        logoUrl: tool.logoUrl || `https://picsum.photos/seed/${tool.id}/200/200`
      })) as AITool[];
      
      aiExplanation = aiResult.aiExplanation;
    } catch (error) {
      console.error("AI Search Error:", error);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        {!q && (
          <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6 animate-fade-in">
                <TrendingUp className="h-3 w-3" />
                Global AI Intelligence at Your Fingertips
              </div>
              <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                Scout the Best AI Tools <span className="text-primary italic">in the World</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Discover, compare, and harness the power of AI tools from across the globe. Our AI-powered search finds the perfect solutions for any task.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="rounded-full h-12 px-8 font-bold text-base bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                  <Link href="#trending">Browse Trending</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 font-bold text-base bg-background/50 backdrop-blur-sm" asChild>
                  <Link href="/compare">Compare Engine</Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4">
          <AdPlacement type="banner" className="my-12" />

          {/* Search Results Section */}
          {q && (
            <section className="py-12 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold flex items-center gap-2 text-foreground">
                    <SearchIcon className="h-7 w-7 text-primary" />
                    Global AI Search: "{q}"
                  </h2>
                  <p className="text-muted-foreground">Semantic search scanning the global AI landscape</p>
                </div>
                <Button variant="ghost" asChild>
                  <Link href="/">Clear Search</Link>
                </Button>
              </div>

              {aiExplanation && (
                <div className="mb-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Gemini Insights</h4>
                    <p className="text-foreground leading-relaxed italic">
                      "{aiExplanation}"
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <SearchIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Searching for the world's best tools... If results don't appear, try a more specific query.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Trending Tools Section */}
          {!q && (
            <section id="trending" className="py-12">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-3xl font-headline font-bold flex items-center gap-2">
                    <TrendingUp className="h-7 w-7 text-primary" />
                    Featured AI Tools
                  </h2>
                  <p className="text-muted-foreground">High-performance tools recommended by our editors.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          <AdPlacement type="responsive" className="my-12" />

          {/* Browse by Profession */}
          <section className="py-12 bg-muted/30 -mx-4 px-4 rounded-3xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-headline font-bold mb-4">Explore by Role</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every profession has its secret AI weapons. Find yours here.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PROFESSIONS.map(prof => (
                <Link 
                  key={prof.id} 
                  href={`/profession/${prof.slug}`}
                  className="group p-6 rounded-2xl bg-background border hover:border-primary/50 hover:shadow-lg transition-all text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <LayoutGrid className="h-6 w-6" />
                  </div>
                  <span className="font-bold text-sm block">{prof.name}</span>
                </Link>
              ))}
            </div>
          </section>

          <AdPlacement type="banner" className="my-12" />
        </div>
      </main>

      <footer className="border-t bg-muted/20 py-12 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                TS
              </div>
              <span className="font-headline font-bold text-lg tracking-tight">
                AI Tool <span className="text-primary">Scout</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Global intelligence for professional AI discovery.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/compare" className="hover:text-primary transition-colors">Comparison Tool</Link></li>
              <li><Link href="/submit-tool" className="hover:text-primary transition-colors">Submit Tool</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Roles</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {PROFESSIONS.slice(0, 4).map(p => (
                <li key={p.id}><Link href={`/profession/${p.slug}`} className="hover:text-primary transition-colors">{p.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Stay Ahead</h4>
            <p className="text-sm text-muted-foreground mb-4">The AI world moves fast. We'll keep you updated.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-background border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary" />
              <Button size="sm">Go</Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Tool Scout. Global search powered by Gemini.
        </div>
      </footer>
    </div>
  );
}
