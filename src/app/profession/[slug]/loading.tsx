
import { GlobalLoader } from "@/components/GlobalLoader";

export default function ProfessionLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <GlobalLoader 
        title="Analyzing Professional Market"
        message="Mapping specialized AI capabilities and cross-referencing industry tools for your career path..."
      />
    </div>
  );
}
