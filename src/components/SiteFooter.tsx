import { Brain } from "lucide-react";

export const SiteFooter = () => (
  <footer className="bg-foreground text-background py-10 mt-auto">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-2xl bg-background/10 flex items-center justify-center">
          <Brain className="w-4 h-4" />
        </div>
        <span className="font-display text-lg font-semibold">MindCare</span>
      </div>
      <p className="text-sm text-background/60">A calmer mind, one breath at a time.</p>
      <p className="text-sm text-background/60">© 2025 MindCare</p>
    </div>
  </footer>
);
