import { useEffect, useMemo, useState } from "react";
import { Activity, Laugh, Smile, Meh, Frown, CloudRain, Sparkles, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

const STORAGE_KEY = "mindcare.moods.v1";

type MoodEntry = { id: string; score: number; label: string; note: string; ts: number };

const moodOptions = [
  { score: 5, label: "Great", icon: Laugh, color: "text-emerald-500", bg: "bg-emerald-100", ring: "ring-emerald-400" },
  { score: 4, label: "Good", icon: Smile, color: "text-primary", bg: "bg-primary/10", ring: "ring-primary" },
  { score: 3, label: "Okay", icon: Meh, color: "text-amber-500", bg: "bg-amber-100", ring: "ring-amber-400" },
  { score: 2, label: "Low", icon: Frown, color: "text-orange-500", bg: "bg-orange-100", ring: "ring-orange-400" },
  { score: 1, label: "Stressed", icon: CloudRain, color: "text-rose-500", bg: "bg-rose-100", ring: "ring-rose-400" },
];

const insights = (avg: number) => {
  if (avg >= 4.2) return "You're flourishing. Keep doing what's working — small joys compound.";
  if (avg >= 3.4) return "Steady and balanced. A few daily rituals could lift you even higher.";
  if (avg >= 2.6) return "You've had ups and downs. Try a breathing session or write what's weighing on you.";
  return "It's been a heavy stretch. Be gentle with yourself — chat with MindCare or try the 4-7-8 breath.";
};

const formatDay = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const Mood = () => {
  const [entries, setEntries] = useState<MoodEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  const log = () => {
    if (selected === null) return;
    const opt = moodOptions.find((o) => o.score === selected)!;
    setEntries((e) => [
      { id: crypto.randomUUID(), score: opt.score, label: opt.label, note: note.trim(), ts: Date.now() },
      ...e,
    ]);
    setSelected(null);
    setNote("");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  };

  const remove = (id: string) => setEntries((e) => e.filter((x) => x.id !== id));
  const clearAll = () => {
    if (confirm("Clear all mood history?")) setEntries([]);
  };

  const stats = useMemo(() => {
    if (!entries.length) return null;
    const last7 = entries.filter((e) => Date.now() - e.ts < 7 * 24 * 60 * 60 * 1000);
    const avg = last7.reduce((a, e) => a + e.score, 0) / (last7.length || 1);
    const streakDays = new Set(last7.map((e) => new Date(e.ts).toDateString())).size;
    return { avg, count7: last7.length, streakDays, total: entries.length };
  }, [entries]);

  const chartData = useMemo(() => {
    const days: { day: string; ts: number; avg: number | null }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const dayEntries = entries.filter((e) => e.ts >= start && e.ts < end);
      const avg = dayEntries.length ? dayEntries.reduce((a, e) => a + e.score, 0) / dayEntries.length : null;
      days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), ts: start, avg });
    }
    return days;
  }, [entries]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteNav />
      <main className="flex-1 container py-10 lg:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Mood Tracking</span>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2 text-balance">
              How are you feeling today?
            </h1>
            <p className="text-muted-foreground mt-3 text-lg">Tiny check-ins reveal patterns you couldn't see alone.</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Logger */}
            <Card className="lg:col-span-3 p-8 rounded-3xl border-border/60 bg-gradient-soft shadow-soft">
              <h2 className="font-display text-2xl font-semibold mb-2">Log your mood</h2>
              <p className="text-sm text-muted-foreground mb-6">Tap a feeling — add a note if you'd like.</p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {moodOptions.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setSelected(m.score)}
                    className={`p-4 rounded-2xl border-2 transition-all hover:-translate-y-1 bg-background ${
                      selected === m.score
                        ? `border-transparent ring-2 ${m.ring} ring-offset-2 ring-offset-background`
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-full ${m.bg} flex items-center justify-center mb-2`}>
                      <m.icon className={`w-6 h-6 ${m.color}`} />
                    </div>
                    <div className="text-xs font-medium">{m.label}</div>
                  </button>
                ))}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's behind this feeling? (optional)"
                rows={3}
                className="w-full px-5 py-3 rounded-2xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex items-center justify-between gap-3 mt-5">
                {justLogged ? (
                  <p className="text-sm text-primary font-medium flex items-center gap-1.5 animate-fade-up">
                    <Sparkles className="w-4 h-4" /> Mood saved 🌿
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Stored on your device only.</p>
                )}
                <Button
                  onClick={log}
                  disabled={selected === null}
                  size="lg"
                  className="rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"
                >
                  Save mood
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <Card className="lg:col-span-2 p-8 rounded-3xl border-border/60 bg-gradient-calm text-primary-foreground shadow-calm">
              <div className="flex items-center gap-2 mb-6 opacity-90">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Your week</span>
              </div>
              {stats ? (
                <>
                  <div className="font-display text-6xl font-semibold mb-1 tabular-nums">{stats.avg.toFixed(1)}</div>
                  <p className="text-sm opacity-80 mb-6">Average mood (out of 5)</p>
                  <p className="text-base leading-relaxed mb-6 italic opacity-95">"{insights(stats.avg)}"</p>
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-background/20">
                    <div>
                      <div className="font-display text-2xl font-semibold tabular-nums">{stats.count7}</div>
                      <div className="text-xs opacity-80">check-ins</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-semibold tabular-nums">{stats.streakDays}</div>
                      <div className="text-xs opacity-80">active days</div>
                    </div>
                    <div>
                      <div className="font-display text-2xl font-semibold tabular-nums">{stats.total}</div>
                      <div className="text-xs opacity-80">total logs</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center opacity-90">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-60" />
                  <p>Log your first mood to unlock insights and your weekly trend.</p>
                </div>
              )}
            </Card>
          </div>

          {/* Chart */}
          <Card className="mt-6 p-8 rounded-3xl border-border/60 bg-background shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold">7-day trend</h2>
              </div>
              <span className="text-xs text-muted-foreground">Average per day</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-48">
              {chartData.map((d) => {
                const height = d.avg !== null ? `${(d.avg / 5) * 100}%` : "4px";
                return (
                  <div key={d.ts} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-xs font-medium tabular-nums text-foreground">
                      {d.avg !== null ? d.avg.toFixed(1) : "·"}
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 ${
                        d.avg !== null ? "bg-gradient-to-t from-primary to-primary-glow" : "bg-muted"
                      }`}
                      style={{ height }}
                    />
                    <div className="text-xs text-muted-foreground">{d.day}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* History */}
          <Card className="mt-6 p-8 rounded-3xl border-border/60 bg-background shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-semibold">History</h2>
              </div>
              {entries.length > 0 && (
                <Button onClick={clearAll} variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-1.5" /> Clear all
                </Button>
              )}
            </div>
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No entries yet. Your first mood will land here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {entries.slice(0, 20).map((e) => {
                  const opt = moodOptions.find((o) => o.score === e.score)!;
                  return (
                    <li key={e.id} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/40 hover:bg-muted/70 transition-colors group">
                      <div className={`w-10 h-10 rounded-full ${opt.bg} flex items-center justify-center shrink-0`}>
                        <opt.icon className={`w-5 h-5 ${opt.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-medium">{e.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDay(e.ts)} · {formatTime(e.ts)}
                          </span>
                        </div>
                        {e.note && <p className="text-sm text-muted-foreground leading-relaxed">{e.note}</p>}
                      </div>
                      <button
                        onClick={() => remove(e.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Mood;
