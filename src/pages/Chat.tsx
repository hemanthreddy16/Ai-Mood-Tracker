import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, Trash2, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

type Msg = { role: "bot" | "user"; text: string; ts: number };

const STORAGE_KEY = "mindcare.chat.v1";

const greeting: Msg = {
  role: "bot",
  text: "Hi, I'm MindCare 🌿 I'm here to listen — no judgment, no pressure. What's on your mind today?",
  ts: Date.now(),
};

const quickPrompts = [
  "I feel stressed about exams",
  "I'm feeling anxious",
  "I had a great day",
  "I can't sleep",
  "I feel lonely",
  "Help me focus",
];

const responses: { keys: string[]; reply: string }[] = [
  { keys: ["stress", "stressed", "overwhelm"], reply: "Stress is real — and it's a signal, not a flaw. Try a 4-7-8 breath: inhale for 4s, hold for 7s, exhale for 8s. Want me to walk you through a short grounding exercise too?" },
  { keys: ["exam", "test", "study"], reply: "Exam pressure can feel huge. Break study into 25-min focus blocks with 5-min breaks (Pomodoro). And remember — your worth isn't your grade. What subject is weighing on you most?" },
  { keys: ["anxious", "anxiety", "worry", "nervous"], reply: "Anxiety can feel overwhelming. Let's try grounding: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. It pulls you back to right now." },
  { keys: ["sad", "down", "depress", "low", "cry"], reply: "I'm really sorry you're feeling this way. Your feelings are valid. Sometimes naming what hurts helps — would you like to share what's behind it, or would gentle company feel better right now?" },
  { keys: ["happy", "great", "good", "amazing", "joy"], reply: "That's wonderful to hear 🌿 Take a moment to really savor it — what's one small thing that contributed to today feeling good?" },
  { keys: ["sleep", "insomnia", "tired", "exhaust"], reply: "Sleep struggles are tough. Try dimming lights an hour before bed, no screens in the last 30 min, and a slow 4-7-8 breath as you lie down. The Sleep Wind-Down meditation in our Stress Relief tab can help too." },
  { keys: ["lonely", "alone", "isolated"], reply: "Loneliness is one of the hardest feelings — and one of the most human. Reaching out, even here, takes courage. Is there one person you'd feel comfortable sending a small message to today?" },
  { keys: ["angry", "anger", "frustrat", "mad"], reply: "Anger often points to a boundary that was crossed or a need that wasn't met. Take a slow breath. Can you tell me what happened — without filtering?" },
  { keys: ["focus", "concentrate", "distract"], reply: "Focus is a muscle. Try this: pick ONE task, set a 25-min timer, put your phone in another room. When the timer ends, take a 5-min walk. Want help breaking down the task?" },
  { keys: ["thank", "thanks"], reply: "You're so welcome. I'm here anytime 🌿" },
  { keys: ["hi", "hello", "hey"], reply: "Hello 🌿 I'm glad you stopped by. How are you feeling right now — physically and emotionally?" },
];

const generateReply = (input: string): string => {
  const lower = input.toLowerCase();
  const match = responses.find((r) => r.keys.some((k) => lower.includes(k)));
  if (match) return match.reply;
  return "Thank you for sharing that with me. I'm listening. Can you tell me a little more about what's behind those feelings?";
};

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [greeting];
  });
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value, ts: Date.now() }]);
    setInput("");
    setTyping(true);
    const delay = 700 + Math.min(value.length * 25, 1500);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: generateReply(value), ts: Date.now() }]);
      setTyping(false);
    }, delay);
  };

  const clear = () => {
    setMessages([greeting]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <SiteNav />
      <main className="flex-1 container py-10 lg:py-14">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">AI Chat</span>
              <h1 className="font-display text-4xl md:text-5xl font-semibold mt-2 text-balance">
                Talk it out, anytime.
              </h1>
              <p className="text-muted-foreground mt-2">A judgment-free companion. Your conversation stays in your browser.</p>
            </div>
            <Button onClick={clear} variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-destructive shrink-0">
              <Trash2 className="w-4 h-4 mr-1.5" /> Clear
            </Button>
          </div>

          <Card className="rounded-3xl border-border/60 bg-background shadow-soft overflow-hidden flex flex-col h-[65vh] min-h-[500px]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60 bg-gradient-soft">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-calm flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">MindCare</h3>
                <p className="text-xs text-muted-foreground">Always here · Private</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-foreground text-background rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start animate-fade-up">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="px-6 pb-2">
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Try a quick start
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-border/60 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Share what's on your mind…"
                className="flex-1 px-5 py-3 rounded-full bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Button
                onClick={() => send()}
                size="icon"
                className="rounded-full w-12 h-12 bg-foreground text-background hover:bg-foreground/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <p className="text-xs text-muted-foreground text-center mt-6 max-w-md mx-auto">
            <MessageCircle className="w-3 h-3 inline mr-1" />
            MindCare is a supportive companion, not a replacement for professional care. If you're in crisis, please reach out to a helpline.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Chat;
