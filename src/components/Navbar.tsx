
"use client";

import Link from "next/link";
import { Search, Menu, Plus, LayoutDashboard, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROFESSIONS } from "@/lib/db";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "./ui/badge";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolsCount = searchParams.get('tools')?.split(',').filter(Boolean).length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            TS
          </div>
          <span className="font-headline font-bold text-xl tracking-tight hidden sm:block">
            AI Tool <span className="text-primary">Scout</span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search AI tools by name or profession..."
            className="w-full h-10 pl-10 pr-4 rounded-full border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

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

          <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2 relative">
            <Link href={toolsCount > 0 ? `/compare?tools=${searchParams.get('tools')}` : '/compare'}>
              <LayoutDashboard className="h-4 w-4" />
              Compare
              {toolsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                  {toolsCount}
                </span>
              )}
            </Link>
          </Button>

          <Button size="sm" asChild className="gap-2 bg-primary hover:bg-primary/90">
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
