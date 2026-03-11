
import { GlobalLoader } from "@/components/GlobalLoader";

export default function ToolLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <GlobalLoader 
        title="Researching Tool Profile"
        message="Consulting global intelligence to provide a comprehensive analysis of features, pricing, and professional impact..."
      />
    </div>
  );
}
