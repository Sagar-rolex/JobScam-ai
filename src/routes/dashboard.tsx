import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Shield, ShieldAlert, ShieldCheck, FileWarning, TrendingUp, Search, Ban } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Scam Statistics | ScamShield.AI" },
      { name: "description", content: "Live statistics on detected job scams, verified jobs and user reports." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Total Scams Detected", value: "12,847", icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Verified Safe Jobs", value: "5,219", icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
  { label: "User Reports", value: "2,341", icon: FileWarning, color: "text-warning", bg: "bg-warning/15" },
  { label: "Detection Accuracy", value: "96.4%", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

const categories = [
  { name: "Fake Hiring", value: 4280 },
  { name: "Pay-to-Apply", value: 3110 },
  { name: "Pyramid", value: 1840 },
  { name: "Data Theft", value: 2140 },
  { name: "Investment", value: 1477 },
];

const monthly = [
  { month: "Jan", scams: 820, verified: 320 },
  { month: "Feb", scams: 940, verified: 380 },
  { month: "Mar", scams: 1120, verified: 410 },
  { month: "Apr", scams: 1320, verified: 460 },
  { month: "May", scams: 1580, verified: 520 },
  { month: "Jun", scams: 1810, verified: 590 },
];

const blacklist = [
  { name: "FastCash Hiring", reports: 142, type: "Pay-to-Apply" },
  { name: "Global Tech Solutions Pvt", reports: 98, type: "Fake Hiring" },
  { name: "BrightCareer Hub", reports: 76, type: "Data Theft" },
  { name: "EarnHome Networks", reports: 64, type: "Pyramid" },
  { name: "Quick Profits Marketing", reports: 51, type: "Investment" },
  { name: "WorkFromHome India Ltd", reports: 43, type: "Pay-to-Apply" },
];

const COLORS = ["oklch(0.7 0.22 280)", "oklch(0.78 0.18 195)", "oklch(0.72 0.22 320)", "oklch(0.72 0.2 155)", "oklch(0.75 0.2 30)"];

function Dashboard() {
  const [search, setSearch] = useState("");
  const filtered = blacklist.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary"><Shield className="h-3 w-3 mr-1.5" /> Analytics</Badge>
        <h1 className="text-4xl md:text-5xl font-bold">Scam Detection <span className="text-gradient-cyber">Dashboard</span></h1>
        <p className="text-muted-foreground mt-3">Real-time statistics from the ScamShield platform.</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-6 hover:shadow-card transition-all">
            <div className={`h-11 w-11 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold mb-1">Scam Categories</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribution by scam type</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                {categories.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-1">Monthly Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">Scams flagged vs. jobs verified</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="scams" fill="oklch(0.7 0.22 280)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="verified" fill="oklch(0.78 0.18 195)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Blacklist */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-lg">Fake Company Blacklist</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blacklist..." className="pl-9 w-64" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                <th className="py-3 px-2">Company</th>
                <th className="py-3 px-2">Type</th>
                <th className="py-3 px-2 text-right">Reports</th>
                <th className="py-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.name} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 font-medium">{b.name}</td>
                  <td className="py-3 px-2"><Badge variant="outline">{b.type}</Badge></td>
                  <td className="py-3 px-2 text-right font-mono">{b.reports}</td>
                  <td className="py-3 px-2 text-right"><Badge variant="destructive">Blacklisted</Badge></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No matches found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
