"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PROFESSIONS, WORK_CATEGORIES } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Send } from "lucide-react";
import { aiSeoContentGenerator } from "@/ai/flows/ai-seo-content-generator-flow";

export default function SubmitToolPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    shortDescription: "",
    longDescription: "",
    seoTitle: "",
    metaDescription: "",
    pricingModel: "Freemium",
    contactEmail: "",
    professions: [] as string[],
    workTypes: [] as string[]
  });

  const handleGenerateAI = async () => {
    if (!formData.name || !formData.shortDescription) {
      toast({
        title: "Missing Information",
        description: "Please provide a tool name and brief overview first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await aiSeoContentGenerator({
        context: 'tool',
        toolName: formData.name,
        toolShortDescription: formData.shortDescription,
        toolWebsiteUrl: formData.websiteUrl,
        professionCategories: formData.professions,
        workCategories: formData.workTypes
      });

      setFormData(prev => ({
        ...prev,
        longDescription: result.longDescription,
        seoTitle: result.seoTitle,
        metaDescription: result.metaDescription
      }));

      toast({
        title: "Success!",
        description: "SEO content generated successfully using AI.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation Failed",
        description: "Could not generate content at this time.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Tool Submitted",
        description: "Your submission is pending review. Thank you!",
      });
    }, 2000);
  };

  const toggleProfession = (slug: string) => {
    setFormData(prev => ({
      ...prev,
      professions: prev.professions.includes(slug) 
        ? prev.professions.filter(p => p !== slug)
        : [...prev.professions, slug]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-headline font-black">List Your AI Tool</h1>
            <p className="text-muted-foreground">Reach thousands of professionals every day. Free submissions available.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about the core of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tool Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. GPT Scout" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input 
                      id="url" 
                      type="url" 
                      placeholder="https://..." 
                      required 
                      value={formData.websiteUrl}
                      onChange={e => setFormData(f => ({ ...f, websiteUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDesc">Brief Overview (Max 160 chars)</Label>
                  <Textarea 
                    id="shortDesc" 
                    placeholder="Describe your tool in one sentence..." 
                    maxLength={160}
                    value={formData.shortDescription}
                    onChange={e => setFormData(f => ({ ...f, shortDescription: e.target.value }))}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Target Professions</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROFESSIONS.map(prof => (
                      <div key={prof.id} className="flex items-center space-x-2 bg-muted/50 p-2 rounded-lg border">
                        <Checkbox 
                          id={`prof-${prof.id}`} 
                          checked={formData.professions.includes(prof.slug)}
                          onCheckedChange={() => toggleProfession(prof.slug)}
                        />
                        <Label htmlFor={`prof-${prof.id}`} className="text-xs cursor-pointer">{prof.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing">Pricing Model</Label>
                  <Select 
                    defaultValue="Freemium" 
                    onValueChange={v => setFormData(f => ({ ...f, pricingModel: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Free">Free</SelectItem>
                      <SelectItem value="Freemium">Freemium</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-primary/5 border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    AI Content Booster
                  </CardTitle>
                  <CardDescription>Generate an SEO-optimized 800-word description automatically.</CardDescription>
                </div>
                <Button 
                  type="button" 
                  onClick={handleGenerateAI} 
                  disabled={isGenerating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Content
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="longDesc">Detailed Description (800+ Words Recommended)</Label>
                  <Textarea 
                    id="longDesc" 
                    placeholder="The AI can generate this for you..." 
                    className="min-h-[300px] bg-white"
                    value={formData.longDescription}
                    onChange={e => setFormData(f => ({ ...f, longDescription: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Page Title</Label>
                    <Input 
                      id="seoTitle" 
                      placeholder="Best AI tool for..." 
                      className="bg-white"
                      value={formData.seoTitle}
                      onChange={e => setFormData(f => ({ ...f, seoTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDesc">Meta Description</Label>
                    <Input 
                      id="metaDesc" 
                      placeholder="Search engine summary..." 
                      className="bg-white"
                      value={formData.metaDescription}
                      onChange={e => setFormData(f => ({ ...f, metaDescription: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-6">
              <Button type="submit" size="lg" className="px-12 rounded-full font-bold h-14 text-lg shadow-xl" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                Submit Tool for Review
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}