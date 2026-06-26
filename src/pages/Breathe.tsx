import { StressManagement } from "@/components/StressManagement";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const Breathe = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SiteNav />
    <main className="flex-1">
      <StressManagement />
    </main>
    <SiteFooter />
  </div>
);

export default Breathe;
