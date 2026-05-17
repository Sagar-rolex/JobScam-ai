import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, Loader2, AlertTriangle, CheckCircle2, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { analyzeJob, type JobInput, type ScamResult } from "@/lib/scam-detector";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Scam Detector — Analyze Any Job Posting | ScamShield.AI" },
      { name: "description", content: "Paste job details and our AI scores scam probability in real-time." },
    ],
  }),
  component: Detect,
});

const initial: JobInput = { title: "", company: "", email: "", salary: "", description: "", website: "", workType: "Remote" };

function Detect() {
  const [form, setForm] = useState<JobInput>(initial);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);

  const update = <K extends keyof JobInput>(k: K, v: JobInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company) {
      toast.error("Job title and company are required");
      return;
    }
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const r = analyzeJob(form);
      setResult(r);
      setLoading(false);
      toast[r.safe ? "success" : "warning"](
        r.safe ? "Looks legitimate" : `${r.risk} risk detected — ${r.probability}% scam probability`
      );
    }, 1400);
  };

  const tryExample = () => {
    setForm({
      title: "Work From Home Data Entry Job",
      company: "FastCash Hiring",
      email: "hr.fastcash@gmail.com",
      salary: "₹80,000/month",
      description: "Urgent hiring! No experience needed. Earn $$$ from home. Pay registration fee of ₹999 to confirm slot. WhatsApp only.",
      website: "",
      workType: "Remote",
    });
    toast.info("Example scam loaded — click Analyze");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary"><Shield className="h-3 w-3 mr-1.5" /> AI Detector</Badge>
        <h1 className="text-4xl md:text-5xl font-bold">Analyze a <span className="text-gradient-cyber">Job Posting</span></h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Fill in the details below. Our AI will return a scam probability score with explainable reasoning.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <Card className="lg:col-span-3 p-6 md:p-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Job Details</h2>
              <Button type="button" variant="ghost" size="sm" onClick={tryExample}>Try example</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Marketing Intern" />
              </div>
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="e.g. Acme Corp" />
              </div>
              <div className="space-y-2">
                <Label>Recruiter Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="hr@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Salary / Stipend Offered</Label>
                <Input value={form.salary} onChange={(e) => update("salary", e.target.value)} placeholder="₹15,000/month" />
              </div>
              <div className="space-y-2">
                <Label>Company Website</Label>
                <Input value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://company.com" />
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select value={form.workType} onValueChange={(v) => update("workType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job Description</Label>
              <Textarea rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Paste the full job description here..." />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full bg-gradient-cyber shadow-glow h-12 text-base">
              {loading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing posting...</>) : (<><Zap className="mr-2 h-5 w-5" /> Analyze Job Posting</>)}
            </Button>
          </form>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <Card className="p-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <div className="font-semibold">Running AI analysis...</div>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <div>→ Scanning keywords</div>
                <div>→ Verifying email domain</div>
                <div>→ Cross-checking salary</div>
                <div>→ Computing risk score</div>
              </div>
            </Card>
          )}

          {!loading && !result && (
            <Card className="p-8 text-center border-dashed">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <div className="font-semibold">Awaiting analysis</div>
              <div className="text-sm text-muted-foreground mt-2">Submit the form to see your AI scam report.</div>
            </Card>
          )}

          {result && <ResultView result={result} />}
        </div>
      </div>
    </div>
  );
}

function ResultView({ result }: { result: ScamResult }) {
  const riskColor = result.risk === "High" ? "destructive" : result.risk === "Medium" ? "warning" : "success";
  const Icon = result.safe ? ShieldCheck : ShieldAlert;
  const gradient = result.safe ? "bg-gradient-safe" : result.risk === "High" ? "bg-gradient-danger" : "bg-gradient-hero";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className={`p-6 ${gradient} text-primary-foreground border-0 shadow-glow`}>
        <div className="flex items-center justify-between mb-3">
          <Icon className="h-10 w-10" />
          <Badge className="bg-white/20 text-white border-0">{result.safe ? "SAFE" : "UNSAFE"}</Badge>
        </div>
        <div className="text-5xl font-bold">{result.probability}%</div>
        <div className="text-sm opacity-90 mt-1">Scam Probability</div>
        <Progress value={result.probability} className="mt-4 bg-white/20" />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-muted-foreground">Risk Level</div>
          <Badge variant={riskColor === "destructive" ? "destructive" : "secondary"}
            className={riskColor === "success" ? "bg-success/15 text-success" : riskColor === "warning" ? "bg-warning/20 text-warning-foreground" : ""}>
            {result.risk}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold">
          <TrendingUp className="h-5 w-5 text-primary" /> {result.risk} Risk Job
        </div>
      </Card>

      {result.reasons.length > 0 && (
        <Card className="p-5 border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold">Warning Signals ({result.reasons.length})</h3>
          </div>
          <ul className="space-y-2">
            {result.reasons.map((r, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="text-destructive mt-0.5">⚠</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {result.positives.length > 0 && (
        <Card className="p-5 border-success/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold">Positive Signals</h3>
          </div>
          <ul className="space-y-2">
            {result.positives.map((p, i) => (
              <li key={i} className="text-sm flex gap-2 text-muted-foreground">
                <span className="text-success mt-0.5">✓</span><span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-semibold mb-3 text-sm">Signal Breakdown</h3>
        <div className="space-y-2">
          {result.signals.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-xs">
              <span className={s.triggered ? "text-destructive font-medium" : "text-muted-foreground"}>
                {s.triggered ? "●" : "○"} {s.name}
              </span>
              <span className="font-mono">{s.triggered ? `+${s.weight}` : "0"}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
