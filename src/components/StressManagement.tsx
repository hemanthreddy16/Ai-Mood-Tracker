import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Wind, Flower2, Music, Footprints, BookOpen, Moon, Heart, X, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

type Phase = { label: string; seconds: number };
type Pattern = { name: string; desc: string; phases: Phase[] };

const patterns: Pattern[] = [
  {
    name: "Box Breathing",
    desc: "Inhale, hold, exhale, hold — all equal. Instant calm before exams or interviews.",
    phases: [
      { label: "Breathe In", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Breathe Out", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
  },
  {
    name: "4-7-8 Relaxing",
    desc: "Releases anxiety and prepares the body for rest. Excellent before sleep.",
    phases: [
      { label: "Breathe In", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Breathe Out", seconds: 8 },
    ],
  },
  {
    name: "Calm & Focus",
    desc: "A simple 5-5 rhythm that steadies the nervous system before study sessions.",
    phases: [
      { label: "Breathe In", seconds: 5 },
      { label: "Breathe Out", seconds: 5 },
    ],
  },
];

type Meditation = {
  icon: typeof Flower2;
  title: string;
  duration: string;
  minutes: number;
  desc: string;
  tone: "calm" | "warm" | "deep" | "bright";
  script: string[];
};

const meditations: Meditation[] = [
  {
    icon: Flower2, title: "Mindful Awareness", duration: "5 min", minutes: 5, tone: "calm",
    desc: "Notice your breath and body without judgment. A gentle reset for any moment of the day.",
    script: [
      "Settle into your seat. Let your shoulders soften.",
      "Bring attention to your natural breath — no need to change it.",
      "Notice the cool air entering, the warm air leaving.",
      "When the mind wanders, gently return to the breath.",
      "Widen awareness to sounds around you, then to the whole body.",
      "Take one final, deeper breath. Slowly open your eyes.",
    ],
  },
  {
    icon: Footprints, title: "Body Scan", duration: "10 min", minutes: 10, tone: "deep",
    desc: "Travel attention slowly from toes to crown, releasing tension you didn't know you held.",
    script: [
      "Lie down or sit comfortably. Close your eyes.",
      "Bring attention to your feet — notice any sensation.",
      "Move up to the calves and knees. Soften what is tight.",
      "Travel into the hips, belly, and lower back. Release.",
      "Move to the chest and shoulders — let them drop.",
      "Notice the arms, hands, neck, and jaw.",
      "Rest attention on the forehead and crown of the head.",
      "Feel the body as one whole, breathing peacefully.",
    ],
  },
  {
    icon: Heart, title: "Loving-Kindness", duration: "8 min", minutes: 8, tone: "warm",
    desc: "Send warm wishes to yourself and others. Builds compassion and softens self-criticism.",
    script: [
      "Place a hand over your heart. Take three slow breaths.",
      "Silently say: May I be happy. May I be healthy.",
      "May I be safe. May I live with ease.",
      "Picture someone you love. Send the same wishes to them.",
      "Now picture someone neutral — a stranger you've seen.",
      "Extend the wishes to someone difficult, if you can.",
      "Finally, send loving-kindness to all beings everywhere.",
    ],
  },
  {
    icon: Music, title: "Sound Bath", duration: "15 min", minutes: 15, tone: "bright",
    desc: "Let layered ambient tones wash over you. Ideal between back-to-back study blocks.",
    script: [
      "Close your eyes and let the sound surround you.",
      "There is nothing to do — only listen.",
      "Notice how the tones rise and fall like waves.",
      "Let thoughts come and go with the sound.",
      "Feel your body resonating with the vibration.",
      "Rest in the spaces between the notes.",
    ],
  },
  {
    icon: BookOpen, title: "Guided Visualization", duration: "12 min", minutes: 12, tone: "calm",
    desc: "Picture a safe, restful place in vivid detail to reduce racing thoughts and anxiety.",
    script: [
      "Imagine a place where you feel completely safe.",
      "Notice the colors around you — what do you see?",
      "Listen for sounds — wind, water, birds, silence.",
      "Feel the temperature on your skin.",
      "Walk slowly through this place. Touch something nearby.",
      "Sit down here. Know you can return whenever you need.",
    ],
  },
  {
    icon: Moon, title: "Sleep Wind-Down", duration: "20 min", minutes: 20, tone: "deep",
    desc: "Slow-paced narration that walks you toward deep, restorative sleep.",
    script: [
      "Lie back. Let the bed fully support your weight.",
      "Take a long inhale… and an even longer exhale.",
      "Release the day. There is nothing left to do.",
      "Soften your eyes behind the eyelids.",
      "Let your jaw, tongue, and throat go heavy.",
      "Imagine sinking gently downward, like into warm water.",
      "Each breath carries you deeper into rest.",
      "Allow sleep to find you whenever it is ready.",
    ],
  },
];

const toneFreqs: Record<Meditation["tone"], number[]> = {
  calm: [220, 329.63],
  warm: [196, 293.66],
  deep: [110, 164.81],
  bright: [261.63, 392, 523.25],
};

export const StressManagement = () => {
  const [patternIdx, setPatternIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0); // ms within phase
  const [cycle, setCycle] = useState(0);
  const lastTickRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Meditation session state
  const [activeMed, setActiveMed] = useState<Meditation | null>(null);
  const [sessionRunning, setSessionRunning] = useState(false);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([]);
  const sessionTimerRef = useRef<number | null>(null);

  const totalSec = activeMed ? activeMed.minutes * 60 : 0;
  const stepIdx = activeMed
    ? Math.min(activeMed.script.length - 1, Math.floor((sessionElapsed / totalSec) * activeMed.script.length))
    : 0;
  const sessionProgress = totalSec ? (sessionElapsed / totalSec) * 100 : 0;
  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const stopAudio = () => {
    audioNodesRef.current.forEach(({ osc, gain }) => {
      try {
        const ctx = audioCtxRef.current!;
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.5);
      } catch {
        /* noop */
      }
    });
    audioNodesRef.current = [];
  };

  const startAudio = (tone: Meditation["tone"]) => {
    if (muted) return;
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    stopAudio();
    toneFreqs[tone].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      gain.gain.linearRampToValueAtTime(0.06 / (i + 1), ctx.currentTime + 1.5);
      audioNodesRef.current.push({ osc, gain });
    });
  };

  const openSession = (m: Meditation) => {
    setActiveMed(m);
    setSessionElapsed(0);
    setSessionRunning(true);
  };

  const closeSession = () => {
    setSessionRunning(false);
    setActiveMed(null);
    setSessionElapsed(0);
    stopAudio();
    if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
  };

  useEffect(() => {
    if (!activeMed) return;
    if (sessionRunning) {
      startAudio(activeMed.tone);
      sessionTimerRef.current = window.setInterval(() => {
        setSessionElapsed((s) => {
          if (s + 1 >= totalSec) {
            setSessionRunning(false);
            stopAudio();
            return totalSec;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      stopAudio();
      if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
    }
    return () => {
      if (sessionTimerRef.current) window.clearInterval(sessionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionRunning, activeMed]);

  useEffect(() => {
    if (muted) stopAudio();
    else if (sessionRunning && activeMed) startAudio(activeMed.tone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  const pattern = patterns[patternIdx];
  const phase = pattern.phases[phaseIdx];
  const phaseMs = phase.seconds * 1000;
  const progress = Math.min(elapsed / phaseMs, 1);

  // Animation loop
  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTickRef.current == null) lastTickRef.current = ts;
      const delta = ts - lastTickRef.current;
      lastTickRef.current = ts;
      setElapsed((e) => {
        const next = e + delta;
        if (next >= phaseMs) {
          setPhaseIdx((p) => {
            const np = (p + 1) % pattern.phases.length;
            if (np === 0) setCycle((c) => c + 1);
            return np;
          });
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, phaseMs, pattern.phases.length]);

  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setElapsed(0);
    setCycle(0);
  };

  const switchPattern = (i: number) => {
    setPatternIdx(i);
    setPhaseIdx(0);
    setElapsed(0);
    setCycle(0);
    setRunning(false);
  };

  // Scale circle: inhale grows, exhale shrinks, hold stays
  const isInhale = phase.label === "Breathe In";
  const isExhale = phase.label === "Breathe Out";
  const scale = isInhale ? 0.6 + 0.4 * progress : isExhale ? 1 - 0.4 * progress : phaseIdx === 0 ? 0.6 : 1;
  const remaining = Math.max(0, Math.ceil((phaseMs - elapsed) / 1000));

  return (
    <section id="stress" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      <div className="container relative">
        <div className="max-w-2xl mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Stress Management</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">
            Breathe with us. <span className="italic text-primary">Right now.</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
            Science-backed breathing exercises and meditation techniques to calm the nervous system in minutes.
          </p>
        </div>

        {/* Breathing exercise */}
        <Card className="rounded-3xl border-border/60 bg-gradient-soft shadow-soft overflow-hidden mb-8">
          <div className="grid lg:grid-cols-2">
            {/* Animation */}
            <div className="relative bg-gradient-calm p-10 lg:p-14 flex flex-col items-center justify-center min-h-[480px] text-primary-foreground">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-background blur-2xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-accent blur-3xl" />
              </div>
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer ring */}
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--primary-foreground) / 0.15)" strokeWidth="1.5" />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="hsl(var(--primary-foreground))"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress)}`}
                    style={{ transition: running ? "stroke-dashoffset 80ms linear" : "none" }}
                  />
                </svg>
                {/* Breathing circle */}
                <div
                  className="w-44 h-44 rounded-full bg-background/20 backdrop-blur-sm border border-background/30 flex items-center justify-center"
                  style={{
                    transform: `scale(${scale})`,
                    transition: running ? "transform 80ms linear" : "transform 600ms ease-out",
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-widest opacity-80 mb-1">{phase.label}</div>
                    <div className="font-display text-5xl font-semibold tabular-nums">{remaining}</div>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 flex items-center gap-3">
                <Button
                  onClick={() => setRunning((r) => !r)}
                  size="lg"
                  className="rounded-full h-14 px-7 bg-background text-primary hover:bg-background/90 shadow-soft"
                >
                  {running ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Begin</>}
                </Button>
                <Button
                  onClick={reset}
                  size="lg"
                  variant="outline"
                  className="rounded-full h-14 w-14 p-0 border-background/30 bg-background/10 backdrop-blur text-primary-foreground hover:bg-background/20 hover:text-primary-foreground"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative mt-4 text-sm opacity-80">Cycles completed: <span className="font-semibold tabular-nums">{cycle}</span></div>
            </div>

            {/* Pattern picker */}
            <div className="p-8 lg:p-12">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Wind className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Breathing Exercises</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold mb-6">Choose a rhythm</h3>
              <div className="space-y-3">
                {patterns.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => switchPattern(i)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      i === patternIdx
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-lg font-semibold">{p.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {p.phases.map((ph) => ph.seconds).join("·")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Meditation library */}
        <div className="flex items-center gap-2 mb-2 text-primary">
          <Flower2 className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Meditation Techniques</span>
        </div>
        <h3 className="font-display text-2xl md:text-3xl font-semibold mb-8">A small library to find your calm</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {meditations.map((m) => (
            <Card
              key={m.title}
              onClick={() => openSession(m)}
              className="p-7 rounded-3xl border-border/60 bg-background hover:shadow-soft hover:-translate-y-1 transition-all duration-500 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-gradient-warm transition-colors">
                  <m.icon className="w-6 h-6 text-secondary-foreground group-hover:text-accent-foreground transition-colors" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{m.duration}</span>
              </div>
              <h4 className="font-display text-xl font-semibold mb-2">{m.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.desc}</p>
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Play className="w-3.5 h-3.5" /> Start session
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Meditation session player */}
      <Dialog open={!!activeMed} onOpenChange={(o) => { if (!o) closeSession(); }}>
        <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-gradient-soft p-0 overflow-hidden">
          {activeMed && (
            <div className="p-8">
              <DialogTitle className="sr-only">{activeMed.title}</DialogTitle>
              <DialogDescription className="sr-only">{activeMed.desc}</DialogDescription>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-warm flex items-center justify-center">
                    <activeMed.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display text-2xl font-semibold leading-tight">{activeMed.title}</h4>
                    <span className="text-xs font-mono text-muted-foreground">{activeMed.duration} session</span>
                  </div>
                </div>
                <button
                  onClick={closeSession}
                  className="w-9 h-9 rounded-full bg-background/60 hover:bg-background flex items-center justify-center text-muted-foreground"
                  aria-label="Close session"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl bg-background/70 backdrop-blur p-6 mb-6 min-h-[140px] flex items-center">
                <p className="font-display text-lg md:text-xl leading-relaxed text-foreground text-balance">
                  “{activeMed.script[stepIdx]}”
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground mb-2">
                <span className="tabular-nums">{mmss(sessionElapsed)}</span>
                <span>Step {stepIdx + 1} of {activeMed.script.length}</span>
                <span className="tabular-nums">{mmss(totalSec)}</span>
              </div>
              <Progress value={sessionProgress} className="h-2 mb-6" />

              <div className="flex items-center justify-center gap-3">
                <Button
                  onClick={() => setMuted((m) => !m)}
                  variant="outline"
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  aria-label={muted ? "Unmute ambient sound" : "Mute ambient sound"}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => {
                    if (sessionElapsed >= totalSec) setSessionElapsed(0);
                    setSessionRunning((r) => !r);
                  }}
                  size="lg"
                  className="rounded-full h-14 px-8"
                >
                  {sessionRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> {sessionElapsed >= totalSec ? "Restart" : sessionElapsed > 0 ? "Resume" : "Begin"}</>}
                </Button>
                <Button
                  onClick={() => { setSessionElapsed(0); setSessionRunning(false); }}
                  variant="outline"
                  size="lg"
                  className="rounded-full h-12 w-12 p-0"
                  aria-label="Reset session"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {sessionElapsed >= totalSec && (
                <p className="text-center text-sm text-primary font-medium mt-5">
                  Session complete. Take a breath and notice how you feel. 🌿
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
