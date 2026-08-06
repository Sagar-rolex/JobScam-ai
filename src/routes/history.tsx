import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Download, History as HistoryIcon } from "lucide-react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/history")({
  component: HistoryRoute,
});

const rows = [
  {
    date: "12 Jul 2026",
    company: "TechNova Labs",
    role: "Frontend Intern",
    risk: "Low",
    status: "Saved",
  },
  {
    date: "11 Jul 2026",
    company: "FastCash Hiring",
    role: "Data Entry",
    risk: "High",
    status: "Reported",
  },
  {
    date: "09 Jul 2026",
    company: "BrightCareer Hub",
    role: "HR Intern",
    risk: "Medium",
    status: "Reviewed",
  },
  {
    date: "05 Jul 2026",
    company: "CloudOrbit",
    role: "ML Intern",
    risk: "Low",
    status: "Verified",
  },
];

function HistoryRoute() {
  return (
    <ProtectedRoute role="user">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
              <HistoryIcon className="mr-1.5 h-3 w-3" /> Saved History
            </Badge>
            <h1 className="text-4xl font-bold">Analysis History</h1>
          </div>
          <Button variant="outline" onClick={() => toast.info("History export is UI only.")}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="px-2 py-3">Date</th>
                  <th className="px-2 py-3">Company</th>
                  <th className="px-2 py-3">Role</th>
                  <th className="px-2 py-3">Risk</th>
                  <th className="px-2 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.company}-${row.role}`} className="border-b border-border/50">
                    <td className="px-2 py-3">
                      <CalendarDays className="mr-2 inline h-4 w-4 text-muted-foreground" />
                      {row.date}
                    </td>
                    <td className="px-2 py-3 font-medium">{row.company}</td>
                    <td className="px-2 py-3 text-muted-foreground">{row.role}</td>
                    <td className="px-2 py-3">
                      <Badge variant={row.risk === "High" ? "destructive" : "outline"}>
                        {row.risk}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-right">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
