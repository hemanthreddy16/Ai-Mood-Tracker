import { NavLink, Link } from "react-router-dom";
import { Brain, MessageCircle, Activity, Wind, Home } from "lucide-react";

const links = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/mood", label: "Mood Tracking", icon: Activity },
  { to: "/breathe", label: "Stress Relief", icon: Wind },
];

export const SiteNav = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/75 border-b border-border/50">
      <div className="container flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-calm flex items-center justify-center shadow-soft">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold">MindCare</span>
        </Link>
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <l.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{l.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
