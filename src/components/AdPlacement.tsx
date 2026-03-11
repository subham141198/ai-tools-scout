
'use client';

import { useEffect } from 'react';
import { cn } from "@/lib/utils";

interface AdPlacementProps {
  className?: string;
  type?: 'banner' | 'sidebar' | 'responsive';
  slot?: string; // Optional: specific AdSense slot ID
}

export function AdPlacement({ className, type = 'responsive', slot }: AdPlacementProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    // Push the ad to the window if AdSense is loaded and we have a publisher ID
    if (typeof window !== 'undefined' && (window as any).adsbygoogle && publisherId) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [publisherId]);

  const heights = {
    banner: 'h-[90px]',
    sidebar: 'h-[250px]',
    responsive: 'h-[120px]'
  };

  // If no publisher ID or slot is provided, show a styled placeholder (useful for dev)
  if (!publisherId || !slot) {
    return (
      <div className={cn("ad-container bg-muted/30 border border-dashed border-muted-foreground/30 rounded-lg p-4 flex items-center justify-center text-xs text-muted-foreground uppercase tracking-widest my-8", heights[type], className)}>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground/50">SPONSORED ADVERTISEMENT</p>
          <div className="text-xs">
            {!publisherId ? "AdSense: Missing Publisher ID" : "AdSense: Slot Required"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("my-8 overflow-hidden flex justify-center", className)}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
