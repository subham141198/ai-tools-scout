"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ToolCardSkeleton() {
  return (
    <Card className="group overflow-hidden border border-border/50 shadow-sm bg-card rounded-[2rem] flex flex-col h-full animate-pulse">
      <CardHeader className="p-0 relative h-40 bg-muted/10">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <Skeleton className="w-20 h-20 rounded-[1.5rem]" />
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="absolute top-4 right-4">
          <Skeleton className="h-10 w-10 rounded-2xl" />
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3 gap-2">
          <Skeleton className="h-7 w-3/4 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
        
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </div>
        
        <div className="mt-auto flex flex-wrap gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Skeleton className="flex-1 h-11 rounded-2xl" />
        <Skeleton className="h-11 w-11 rounded-2xl" />
      </CardFooter>
    </Card>
  );
}
