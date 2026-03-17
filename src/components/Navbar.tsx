"use client";

import Link from "next/link";
import { Search, Menu, Plus, LayoutDashboard, Layers, Sparkles, Loader2, X } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolsCount = searchParams.get('tools')?.split(',').filter(Boolean).length || 0;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2 && (showSuggestions || isMobileSearchOpen)) {
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
  }, [searchQuery, showSuggestions, isMobileSearchOpen]);

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
      setIsMobileSearchOpen(false);
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
    router.push(`/?q=${encodeURIComponent(suggestion)}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <AinexaLogo className="hover:scale-105 transition-transform" />
        </Link>

        {/* Desktop Search */}
        <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search AI tools or professions..."
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

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-9 w-9"
            onClick={() => setIsMobileSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
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

          <Button size="sm" asChild className="gap-2 bg-primary hover:bg-primary/90 shadow-md px-3 sm:px-4">
            <Link href="/submit-tool">
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Submit</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/compare" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Compare Tools
                </Link>
              </DropdownMenuItem>
              <div className="h-px bg-muted my-1" />
              <DropdownMenuItem disabled className="text-[10px] font-black uppercase tracking-widest opacity-50">
                Professions
              </DropdownMenuItem>
              {PROFESSIONS.map((prof) => (
                <DropdownMenuItem key={prof.id} asChild>
                  <Link href={`/profession/${prof.slug}`}>
                    {prof.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-background animate-in fade-in duration-200">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-4 p-4 border-b">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search AI tools..."
                  className="w-full h-12 pl-10 pr-10 rounded-xl border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSuggesting && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />
                )}
              </form>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileSearchOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {suggestions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">AI Recommendations</p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-4 py-4 text-lg font-bold border rounded-2xl hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-4"
                    >
                      <Search className="h-5 w-5 opacity-30" />
                      {s}
                    </button>
                  ))}
                </div>
              ) : searchQuery.length < 2 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p className="font-medium">Start typing to see AI suggestions</p>
                </div>
              ) : !isSuggesting && suggestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-medium">Press enter to search for "{searchQuery}"</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
