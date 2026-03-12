"use client";

import Link from "next/link";
import { Search, Menu, Plus, LayoutDashboard, Layers, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROFESSIONS } from "@/lib/db";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { aiSuggestions } from "@/ai/flows/ai-suggestion-flow";
import { AinexaLogo } from "./AinexaLogo";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolsCount = searchParams.get('tools')?.split(',').filter(Boolean).length || 0;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2 && showSuggestions) {
        setIsSuggesting(true);
        try {
          const result = await aiSuggestions({ query: searchQuery });
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error("Suggestion error:", error);
        } finally {
          setIsSuggesting(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    router.push(`/?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="group">
          <AinexaLogo className="hover:scale-105 transition-transform" />
        </Link>

        <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search AI tools by name or profession..."
              className="w-full h-10 pl-10 pr-10 rounded-full border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            {isSuggesting && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-primary" />
            )}
          </form>

          {showSuggestions && (suggestions.length > 0 || isSuggesting) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b bg-muted/30 flex items-center gap-2 px-4">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Suggestions</span>
              </div>
              <div className="p-1">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-primary/5 hover:text-primary rounded-xl transition-colors flex items-center gap-3"
                  >
                    <Search className="h-3 w-3 opacity-30" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden lg:flex gap-2">
                <Layers className="h-4 w-4" />
                Professions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {PROFESSIONS.map((prof) => (
                <DropdownMenuItem key={prof.id} asChild>
                  <Link href={`/profession/${prof.slug}`} className="w-full">
                    {prof.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2 relative border-primary/20 hover:bg-primary/5">
            <Link href={toolsCount > 0 ? `/compare?tools=${searchParams.get('tools')}` : '/compare'}>
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Compare
              {toolsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                  {toolsCount}
                </span>
              )}
            </Link>
          </Button>

          <Button size="sm" asChild className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
            <Link href="/submit-tool">
              <Plus className="h-4 w-4" />
              Submit
            </Link>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
