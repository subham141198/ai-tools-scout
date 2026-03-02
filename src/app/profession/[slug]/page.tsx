
import { PROFESSIONS } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { ToolCard } from "@/components/ToolCard";
import { AdPlacement } from "@/components/AdPlacement";
import { notFound } from "next/navigation";
import { LayoutGrid, Sparkles } from "lucide-react";
import { aiSearch } from "@/ai/flows/ai-search-flow";
import { AITool } from "@/lib/types";

export default async function ProfessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profession = PROFESSIONS.find(p => p.slug === slug);
  
  if (!profession) notFound();

  let tools: AITool[] = [];
  let aiExplanation: string | null = null;

  try {
    // Use AI to find the best tools in the world for this profession
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
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="mb-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight">
            Best AI Tools for <span className="text-primary italic">{profession.name}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the top-rated global AI solutions specifically curated for {profession.name.toLowerCase()} by Gemini Intelligence.
          </p>
        </header>

        <AdPlacement type="banner" />

        {aiExplanation && (
          <div className="mb-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start animate-in fade-in slide-in-from-top-4 max-w-4xl mx-auto">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-primary uppercase tracking-wider">Scout Analysis</h4>
              <p className="text-foreground leading-relaxed italic">
                "{aiExplanation}"
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.length > 0 ? (
            tools.map(tool => <ToolCard key={tool.slug} tool={tool} />)
          ) : (
            <div className="col-span-full py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
              <div className="flex flex-col items-center gap-4">
                <LayoutGrid className="h-12 w-12 text-muted-foreground animate-pulse" />
                <p className="text-muted-foreground font-medium">Scouting global models for {profession.name}...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-16">
          <AdPlacement type="responsive" />
        </div>
      </main>
    </div>
  );
}
