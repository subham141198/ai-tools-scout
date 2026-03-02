import { cn } from "@/lib/utils";

interface AdPlacementProps {
  className?: string;
  type?: 'banner' | 'sidebar' | 'responsive';
}

export function AdPlacement({ className, type = 'responsive' }: AdPlacementProps) {
  const heights = {
    banner: 'h-[90px]',
    sidebar: 'h-[250px]',
    responsive: 'h-[120px]'
  };

  return (
    <div className={cn("ad-container", heights[type], className)}>
      <div className="text-center space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground/50">SPONSORED ADVERTISEMENT</p>
        <div className="text-xs">Google AdSense Placeholder</div>
      </div>
    </div>
  );
}
