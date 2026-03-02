"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MOCK_TOOLS } from "@/lib/db";
import { AITool } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Check, X, Star, ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AdPlacement } from "@/components/AdPlacement";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  
  useEffect(() => {
    const slugs = searchParams.get('tools')?.split(',') || [];
    const tools = MOCK_TOOLS.filter(t => slugs.includes(t.slug));
    setSelectedTools(tools);
  }, [searchParams]);

  const removeTool = (slug: string) => {
    setSelectedTools(prev => prev.filter(t => t.slug !== slug));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-headline font-black mb-4">Compare AI Tools Side-by-Side</h1>
          <p className="text-muted-foreground text-lg">
            Make informed decisions by comparing features, pricing, and capabilities of the leading AI solutions.
          </p>
        </div>

        <AdPlacement type="banner" />

        {selectedTools.length === 0 ? (
          <div className="bg-card rounded-3xl border-2 border-dashed p-20 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No tools selected for comparison</h2>
              <p className="text-muted-foreground">Select tools from the directory to see them compared here.</p>
            </div>
            <Button asChild>
              <Link href="/">Browse AI Tools</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-8">
            <table className="w-full border-collapse bg-card rounded-2xl overflow-hidden shadow-xl border">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-8 text-left w-64 bg-background sticky left-0 z-10 border-r">Feature</th>
                  {selectedTools.map(tool => (
                    <th key={tool.id} className="p-8 min-w-[300px] text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border shadow-sm bg-white">
                          <Image src={tool.logoUrl} alt={tool.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{tool.name}</h3>
                          <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10" onClick={() => removeTool(tool.slug)}>
                            Remove
                          </Button>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <a href={tool.websiteUrl} target="_blank">Visit Site</a>
                        </Button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-bold sticky left-0 bg-background z-10 border-r">Pricing Model</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-6 text-center">
                      <span className="font-bold text-primary">{tool.pricingModel}</span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-bold sticky left-0 bg-background z-10 border-r">Average Rating</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        {tool.rating}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-bold sticky left-0 bg-background z-10 border-r">Key Features</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-6">
                      <ul className="space-y-2">
                        {tool.features.map((f, i) => (
                          <li key={i} className="flex gap-2 items-start text-xs">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-bold sticky left-0 bg-background z-10 border-r">Pros</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-6">
                       <ul className="space-y-1">
                        {tool.pros.slice(0, 3).map((p, i) => <li key={i} className="text-emerald-700 text-xs flex gap-1 items-center"><Check className="h-3 w-3" /> {p}</li>)}
                       </ul>
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-6 font-bold sticky left-0 bg-background z-10 border-r">Best For</td>
                  {selectedTools.map(tool => (
                    <td key={tool.id} className="p-6 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {tool.professionCategories.map(p => (
                          <span key={p} className="text-[10px] bg-secondary px-2 py-0.5 rounded capitalize">{p.replace('-', ' ')}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12">
          <AdPlacement type="responsive" />
        </div>
      </main>
    </div>
  );
}