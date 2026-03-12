'use client';

import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface AdPlacementProps {
  className?: string;
  type?: 'banner' | 'sidebar' | 'responsive';
  slot?: string; // Optional: specific AdSense slot ID
}

export function AdPlacement({ className, type = 'responsive', slot }: AdPlacementProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Only proceed if we have a valid window context, AdSense script is loaded, and we have credentials
    if (typeof window !== 'undefined' && (window as any).adsbygoogle && publisherId && slot) {
      let retryCount = 0;
      const MAX_RETRIES = 5;

      const pushAd = () => {
        try {
          // AdSense needs the container to have a non-zero width/height
          // If the width is 0 (e.g. initial render or hidden element), we wait and retry
          if (adRef.current && adRef.current.offsetWidth > 0) {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          } else if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(pushAd, 200 * retryCount);
          }
        } catch (e) {
          // Catching push errors to prevent app crashes from ad blockers or script failures
        }
      };

      // Small delay to ensure the DOM layout has settled
      const timeoutId = setTimeout(pushAd, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [publisherId, slot]);

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
    <div className={cn("my-8 overflow-hidden flex justify-center w-full", className)}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
