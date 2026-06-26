import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-mindcare.jpg";
import {
  MessageCircle, Activity, Wind, ArrowRight, ShieldCheck, Sparkles,
  Heart, Bell, Lock, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const tools = [
  {
    to: "/chat",
    icon: MessageCircle,
    title: "AI Chat",
    desc: "Talk it out anytime. Our AI companion listens without judgment, 24/7.",
    accent: "bg-gradient-calm text-primary-foreground",
  },
  {
    to: "/mood",
    icon: Activity,
    title: "Mood Tracking",
    desc: "Log how you feel and watch your emotional patterns unfold over time.",
    accent: "bg-gradient-warm text-accent-foreground",
  },
  {
    to: "/breathe",
    icon: Wind,
    title: "Stress Relief",
    desc: "Guided breathing rhythms and meditations to calm your nervous system.",
    accent: "bg-secondary text-secondary-foreground",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-breathe" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
          <div className="space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur border border-border/50 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Mental wellness, redesigned
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-balance">
              A calmer mind,<br />
              <span className="italic text-primary">one breath</span> at a time.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl text-balance">
              MindCare gives you three calm tools — an AI companion, a mood tracker, and guided breathing — all private, all free, all in your browser.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-base bg-foreground text-background hover:bg-foreground/90 shadow-soft">
                <Link to="/chat">Start chatting <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-foreground/20 bg-background/60 backdrop-blur">
                <Link to="/breathe">Breathe with us</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> 100% private</div>
              <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Built for students</div>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-calm rounded-[3rem] blur-2xl opacity-20" />
            <img
              src={heroImg}
              alt="Person meditating with calm aura"
              width={1536}
              height={1024}
              className="relative rounded-[2.5rem] shadow-calm w-full"
            />
          </div>
        </div>
      </header>

      {/* Three tools */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Three ways in</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">
              Pick the tool that meets you where you are.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Link key={t.to} to={t.to} className="group">
                <Card className="p-8 rounded-3xl border-border/60 h-full hover:shadow-soft hover:-translate-y-1 transition-all duration-500 bg-background overflow-hidden relative">
                  <div className={`w-14 h-14 rounded-2xl ${t.accent} flex items-center justify-center mb-6 shadow-soft`}>
                    <t.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold mb-2">{t.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{t.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why MindCare */}
      <section className="py-24 bg-cream/40">
        <div className="container grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Why MindCare</span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 mb-6 text-balance">
              Small daily moments, real change.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              MindCare blends gentle design with science-backed techniques so caring for your mind feels as natural as a deep breath.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: Sparkles, title: "Personalized", desc: "Suggestions adapt to your moods and patterns." },
                { icon: Lock, title: "Private", desc: "Everything stays on your device. No accounts." },
                { icon: Bell, title: "Gentle reminders", desc: "Nudges that respect your time and energy." },
                { icon: Heart, title: "Always kind", desc: "Built to feel supportive, never clinical." },
              ].map((f) => (
                <div key={f.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold mb-1">{f.title}</h4>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-10 rounded-3xl border-border/60 bg-gradient-calm text-primary-foreground shadow-calm">
            <Sparkles className="w-10 h-10 mb-6 opacity-80" />
            <p className="font-display text-2xl md:text-3xl leading-snug font-medium mb-8 text-balance">
              "Caring for your mind isn't a luxury. It's the quiet foundation everything else stands on."
            </p>
            <Button asChild size="lg" className="rounded-full bg-background text-primary hover:bg-background/90">
              <Link to="/chat">Begin your first session <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
