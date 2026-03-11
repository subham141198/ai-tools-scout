
import { getToolBySlug, getTrendingTools } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { AdPlacement } from "@/components/AdPlacement";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ToolCard } from "@/components/ToolCard";
import { aiToolDetails } from "@/ai/flows/ai-tool-details-flow";
import { AITool } from "@/lib/types";
import { Metadata, ResolvingMetadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  let tool = await getToolBySlug(slug);

  if (!tool) {
    try {
      const aiResult = await aiToolDetails({ slug });
      tool = { ...aiResult, slug } as AITool;
    } catch (e) {
      return { title: 'Tool Not Found' };
    }
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: tool.seoTitle || `${tool.name} - Features, Pricing & Review`,
    description: tool.metaDescription || tool.tagline || tool.description.substring(0, 160),
    openGraph: {
      title: tool.name,
      description: tool.tagline,
      images: [tool.logoUrl, ...previousImages],
    },
    alternates: {
      canonical: `https://aitoolscompus.vercel.app/tool/${slug}`,
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  
  let toolData = await getToolBySlug(slug);
  let isAiGenerated = false;

  if (!toolData) {
    try {
      const aiResult = await aiToolDetails({ slug });
      toolData = {
        ...aiResult,
        id: slug,
        slug: slug,
        featured: false,
        approved: true,
        createdAt: new Date().toISOString(),
      } as AITool;
      isAiGenerated = true;
    } catch (error) {
      console.error("Failed to fetch tool details from AI:", error);
    }
  }

  const similarTools = await getTrendingTools();

  if (!toolData) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-8">We couldn't find details for "{slug}". It might be too new or private.</p>
          <Button asChild><Link href="/">Return to Directory</Link></Button>
        </main>
      </div>
    );
  }

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": toolData.name,
    "description": toolData.description,
    "applicationCategory": toolData.workCategories[0] || "BusinessApplication",
    "operatingSystem": "Web-based",
    "url": toolData.websiteUrl,
    "image": toolData.logoUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": toolData.rating,
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "0"
    },
    "offers": {
      "@type": "Offer",
      "price": toolData.pricingModel === "Free" ? "0" : undefined,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {isAiGenerated && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <Globe className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              This profile was generated in real-time by <strong>AI Tool Scout Intelligence</strong> as it's not currently in our local verified directory.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">
            <article>
              {/* Header Section */}
              <section className="bg-card rounded-3xl p-8 border shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white shrink-0">
                      <Image 
                        src={toolData.logoUrl} 
                        alt={`${toolData.name} AI Tool Logo`} 
                        fill 
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tight">{toolData.name}</h1>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-sm px-3">{toolData.pricingModel}</Badge>
                        <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-xl border border-amber-100">
                          <Star className="h-4 w-4 fill-current" />
                          {toolData.rating}
                        </div>
                      </div>
                      <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-tight">{toolData.tagline}</p>
                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button size="lg" className="rounded-full px-10 bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform" asChild>
                          <a href={toolData.websiteUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                            Explore Tool
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                          <Link href={`/compare?tools=${toolData.slug}`}>Compare Engine</Link>
                        </Button>
                      </div>
                    </div>
                 </div>
              </section>

              <AdPlacement type="banner" slot="6062113214" />

              {/* Description & Details */}
              <div className="space-y-8 prose prose-slate max-w-none mt-10">
                <section className="bg-card rounded-2xl p-8 border shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold m-0">In-Depth Analysis</h2>
                  </div>
                  <div className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
                    {toolData.description}
                    
                    <div className="mt-12 space-y-8 text-base">
                      <div className="bg-muted/30 rounded-2xl p-8 border">
                        <h3 className="text-foreground text-xl font-bold mb-4">Core Capabilities</h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                          {toolData.features.map((feature, i) => (
                            <li key={i} className="flex gap-3 items-start bg-background border p-4 rounded-xl shadow-sm">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="font-semibold text-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-3xl">
                          <h4 className="font-bold text-emerald-800 text-lg mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6" />
                            The Advantages
                          </h4>
                          <ul className="space-y-3 list-none p-0 text-emerald-900/80">
                            {toolData.pros.map((pro, i) => (
                              <li key={i} className="flex gap-2 items-start italic">
                                <span className="text-emerald-500 font-bold">•</span>
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-3xl">
                          <h4 className="font-bold text-rose-800 text-lg mb-4 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            The Constraints
                          </h4>
                          <ul className="space-y-3 list-none p-0 text-rose-900/80">
                            {toolData.cons.map((con, i) => (
                              <li key={i} className="flex gap-2 items-start italic">
                                <span className="text-rose-400 font-bold">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-8 border-t">
                        <h3 className="text-foreground text-xl font-bold mb-4">Professional Verdict</h3>
                        <p className="italic leading-relaxed">
                          Based on our {isAiGenerated ? 'AI research' : 'editorial review'}, {toolData.name} is a high-impact solution for professionals working in {toolData.workCategories.join(' and ')}. 
                          Its {toolData.pricingModel} model offers flexibility for teams of various sizes. We recommend it for users specifically looking for {toolData.features[0].toLowerCase()} and {toolData.features[1].toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </article>

            <AdPlacement type="responsive" slot="6062113214" />
            
            {/* Similar Tools */}
            <section className="py-10">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                Discover More Alternatives
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {similarTools.filter(t => t.slug !== toolData.slug).slice(0, 2).map(t => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="bg-card border rounded-3xl p-8 shadow-sm sticky top-24">
              <h3 className="font-bold text-xl mb-6">Specifications</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-muted-foreground">Access Model</span>
                  <Badge variant="outline" className="font-bold text-primary border-primary/20">{toolData.pricingModel}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-muted-foreground">Scout Rating</span>
                  <div className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    {toolData.rating}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Target Roles</span>
                  <div className="flex flex-wrap gap-2">
                    {toolData.professionCategories.map(p => (
                      <Badge key={p} variant="secondary" className="capitalize text-xs font-semibold">{p.replace('-', ' ')}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Domains</span>
                  <div className="flex flex-wrap gap-2">
                    {toolData.workCategories.map(w => (
                      <Badge key={w} variant="outline" className="capitalize text-xs font-semibold">{w.replace('-', ' ')}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <Button size="lg" className="w-full bg-primary font-bold rounded-2xl h-14 shadow-lg shadow-primary/20" asChild>
                  <a href={toolData.websiteUrl} target="_blank">Launch {toolData.name}</a>
                </Button>
                <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 font-bold" asChild>
                  <Link href={`/compare?tools=${toolData.slug}`}>Side-by-Side Compare</Link>
                </Button>
              </div>

              <AdPlacement type="sidebar" slot="6062113214" className="mt-8" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
