import { PROFESSIONS } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeleton } from "@/components/ToolCardSkeleton";
import { AdPlacement } from "@/components/AdPlacement";
import { notFound } from "next/navigation";
import { 
  LayoutGrid, 
  Sparkles, 
  SlidersHorizontal, 
  ChevronDown, 
  Star,
  Search as SearchIcon
} from "lucide-react";
import { aiSearch } from "@/ai/flows/ai-search-flow";
import { AITool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profession = PROFESSIONS.find(p => p.slug === slug);
  
  if (!profession) return { title: 'Profession Not Found' };

  return {
    title: profession.seoTitle || `Top AI Tools for ${profession.name} (2024)`,
    description: profession.seoDescription || `Discover the best AI software and tools for ${profession.name.toLowerCase()} professionals. Curated list with reviews and ratings.`,
    alternates: {
      canonical: `https://aitoolscompus.vercel.app/profession/${slug}`,
    },
  };
}

export default async function ProfessionPage({ params }: Props) {
  const { slug } = await params;
  const profession = PROFESSIONS.find(p => p.slug === slug);
  
  if (!profession) notFound();

  let tools: AITool[] = [];
  let aiExplanation: string | null = null;
  let errorState = false;

  try {
    const aiResult = await aiSearch({ 
      query: `best AI tools for ${profession.name}` 
    });

    tools = aiResult.recommendedTools.map(tool => ({
      ...tool,
      slug: tool.id,
      createdAt: new Date().toISOString(),
      featured: false,
      approved: true,
      logoUrl: tool.logoUrl || `https://picsum.photos/seed/${tool.id}/200/200`
    })) as AITool[];

    aiExplanation = aiResult.aiExplanation;
  } catch (error) {
    console.error("AI Profession Search Error:", error);
    errorState = true;
  }

  // Structured Data for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Best AI Tools for ${profession.name}`,
    "description": `A curated collection of the top AI tools specifically designed for ${profession.name.toLowerCase()} professionals.`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": tools.map((tool, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://aitoolscompus.vercel.app/tool/${tool.slug}`
      }))
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* PLP Header */}
        <header className="mb-12 pb-8 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                <LayoutGrid className="h-3 w-3" />
                Category: Professional Tools
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight leading-none">
                Best AI Tools for <span className="brand-text-gradient italic">{profession.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl font-medium">
                Our AI researchers have curated {tools.length || '...'} of the top-rated global solutions for {profession.name.toLowerCase()} professionals.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full h-12 px-6 gap-2 font-bold shadow-sm">
                    Sort by: Top Rated
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Top Rated</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Newest Arrivals</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <AdPlacement type="banner" slot="6062113214" />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* PLP Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-8 hidden lg:block">
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                <SlidersHorizontal className="h-3 w-3" />
                Market Filters
              </h4>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-black">Access Type</p>
                  <div className="space-y-2">
                    {['Free', 'Freemium', 'Paid', 'Subscription'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors group">
                        <input type="checkbox" className="rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4" />
                        <span className="font-semibold group-hover:font-black">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-black">Scout Rating</p>
                  <div className="space-y-2">
                    {[4.5, 4.0, 3.5].map(rate => (
                      <label key={rate} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors group">
                        <input type="checkbox" className="rounded border-muted-foreground/30 text-primary focus:ring-primary h-4 w-4" />
                        <span className="flex items-center gap-1 font-semibold group-hover:font-black">
                          {rate}+ <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                   <p className="text-sm font-black">Related Roles</p>
                   <div className="flex flex-wrap gap-2">
                    {PROFESSIONS.filter(p => p.slug !== slug).slice(0, 6).map(p => (
                      <Badge key={p.id} variant="secondary" className="bg-muted hover:bg-primary hover:text-white transition-colors cursor-pointer text-[10px] font-black px-3 py-1">
                        <Link href={`/profession/${p.slug}`}>{p.name}</Link>
                      </Badge>
                    ))}
                   </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-3xl p-6 border-2 border-dashed border-muted-foreground/10 text-center">
                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                  Can't find what you're looking for? Try the <Link href="/" className="text-primary underline">Global AI Search</Link> for more niche queries.
                </p>
              </div>
            </div>
          </aside>

          {/* PLP Content Grid */}
          <div className="flex-1 space-y-8">
            {aiExplanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 flex gap-6 items-start animate-in fade-in slide-in-from-top-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xs text-primary uppercase tracking-widest">Global Market Intelligence</h4>
                  <p className="text-foreground leading-relaxed italic font-medium text-lg">
                    "{aiExplanation}"
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {tools.length > 0 ? (
                tools.map(tool => <ToolCard key={tool.slug} tool={tool} />)
              ) : errorState ? (
                <div className="col-span-full py-24 text-center">
                   <p className="text-muted-foreground">Failed to load tools. Please try again later.</p>
                </div>
              ) : (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ToolCardSkeleton key={i} />
                  ))}
                </>
              )}
            </div>

            <div className="pt-12">
              <AdPlacement type="responsive" slot="6062113214" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
