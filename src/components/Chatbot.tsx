import { useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FAQS: { q: RegExp; a: string }[] = [
  { q: /fee|pay|money|deposit/i, a: "Legitimate employers NEVER ask for fees, deposits, or payments to hire you. This is a major red flag." },
  { q: /email|gmail|yahoo/i, a: "Recruiters using free emails (gmail, yahoo) instead of company domains is suspicious. Verify the domain matches the company." },
  { q: /salary|pay|money/i, a: "If a salary seems too good to be true (e.g. ₹2 LPM for an internship), it usually is. Cross-check market rates." },
  { q: /whatsapp|telegram/i, a: "Communicating only via WhatsApp/Telegram with no formal HR process is a common scam pattern." },
  { q: /report|fake|scam/i, a: "Use our Report page to submit suspicious postings. We'll add them to the blacklist." },
  { q: /how|work|detect/i, a: "Our AI checks 6+ signals: suspicious keywords, email domains, salary anomalies, website security, description quality, and company info." },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm ShieldBot 🛡️ Ask me anything about spotting job scams." },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    const match = FAQS.find((f) => f.q.test(userMsg));
    const reply = match?.a ?? "Great question! Generally, verify the company on LinkedIn, check their official website, and never share OTPs or pay any fee.";
    setMessages((m) => [...m, { role: "user", text: userMsg }, { role: "bot", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-cyber shadow-glow flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform z-50"
        aria-label="Open chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-[340px] max-w-[calc(100vw-2rem)] h-[480px] glass rounded-2xl shadow-card flex flex-col z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-cyber flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-sm">ShieldBot</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about scams..."
              className="text-sm"
            />
            <Button size="icon" onClick={send}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </>
  );
}
