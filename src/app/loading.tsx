import { GlobalLoader } from "@/components/GlobalLoader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <GlobalLoader 
        title="Consulting Ainexa Intelligence"
        message="Synthesizing global data to find the world's most advanced AI tools for your request..."
      />
    </div>
  );
}
