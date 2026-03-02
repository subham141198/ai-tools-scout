import { PROFESSIONS, getTools } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { ToolCard } from "@/components/ToolCard";
import { AdPlacement } from "@/components/AdPlacement";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";

export default async function ProfessionPage({ params }: { params: { slug: string } }) {
  const profession = PROFESSIONS.find(p => p.slug === params.slug);
  if (!profession) notFound();

  const tools = await getTools({ profession: profession.slug });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <header className="mb-12 text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight">
            Best AI Tools for <span className="text-primary italic">{profession.name}</span> in 2024
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and compare the top-rated AI solutions specifically designed for {profession.name.toLowerCase()}.
          </p>
        </header>

        <AdPlacement type="banner" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.length > 0 ? (
            tools.map(tool => <ToolCard key={tool.id} tool={tool} />)
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground">No tools found for this profession yet. Check back soon!</p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <AdPlacement type="responsive" />
        </div>
      </main>
    </div>
  );
}