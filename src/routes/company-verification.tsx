import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CheckCircle2, Loader2, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/company-verification")({
  component: CompanyVerification,
});

const companies = [
  { name: "TechNova Labs", status: "Verified", reports: 0, domain: "technova.example" },
  { name: "FastCash Hiring", status: "Blacklisted", reports: 142, domain: "gmail recruiter" },
  { name: "CampusEdge AI", status: "Verified", reports: 1, domain: "campusedge.example" },
];

function CompanyVerification() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const matches = companies.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Enter a company name to verify.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      toast.success("Company verification complete.");
    }, 900);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
          <Building2 className="mr-1.5 h-3 w-3" /> Company Verification
        </Badge>
        <h1 className="text-4xl font-bold">Check a Company Before You Apply</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Search verified and blacklisted company records from the mock ScamShield intelligence
          database.
        </p>
      </div>
      <Card className="glass mx-auto mb-8 max-w-2xl p-5">
        <form onSubmit={submit} className="flex gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company name..."
          />
          <Button disabled={loading} className="bg-gradient-cyber">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {(searched ? matches : companies).map((company) => (
          <Card key={company.name} className="p-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                {company.status === "Verified" ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                )}
              </div>
              <Badge variant={company.status === "Verified" ? "outline" : "destructive"}>
                {company.status}
              </Badge>
            </div>
            <h2 className="font-semibold">{company.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{company.domain}</p>
            <div className="mt-4 border-t pt-4 text-sm">
              Reports: <span className="font-mono">{company.reports}</span>
            </div>
          </Card>
        ))}
      </div>
      {searched && matches.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">No matching company found.</p>
      )}
    </div>
  );
}
