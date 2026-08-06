import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type ApiCompany } from "@/lib/api";

export const Route = createFileRoute("/admin/companies")({
  component: ManageCompanies,
});

function ManageCompanies() {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    try {
      const data = await api.companies();
      setCompanies(data.companies);
    } catch {
      toast.error("Start the backend first: npm.cmd run backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const addCompany = async () => {
    const name = window.prompt("Company name");
    if (!name) return;
    await fetch("http://127.0.0.1:4000/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status: "Verified", reports: 0 }),
    });
    toast.success(`${name} added.`);
    loadCompanies();
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
            Manage Companies
          </Badge>
          <h1 className="text-4xl font-bold">Companies</h1>
        </div>
        <Button onClick={addCompany}>
          <Plus className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>
      <Tabs defaultValue="verified">
        <TabsList className="mb-6">
          <TabsTrigger value="verified">Verified Companies</TabsTrigger>
          <TabsTrigger value="blacklisted">Blacklisted Companies</TabsTrigger>
        </TabsList>
        <TabsContent value="verified">
          <CompanyList
            rows={companies.filter((company) => company.status === "Verified")}
            status="Verified"
            onChange={loadCompanies}
          />
        </TabsContent>
        <TabsContent value="blacklisted">
          <CompanyList
            rows={companies.filter((company) => company.status === "Blacklisted")}
            status="Blacklisted"
            onChange={loadCompanies}
          />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

function CompanyList({
  rows,
  status,
  onChange,
}: {
  rows: ApiCompany[];
  status: "Verified" | "Blacklisted";
  onChange: () => void;
}) {
  const actions =
    status === "Verified" ? ["Edit", "Delete", "Blacklist"] : ["Edit", "Delete", "Verify"];

  const runAction = async (company: ApiCompany, action: string) => {
    if (action === "Delete") {
      await api.deleteCompany(company.id);
      toast.success(`${company.name} deleted.`);
    } else if (action === "Blacklist") {
      await api.updateCompany(company.id, { status: "Blacklisted" });
      toast.success(`${company.name} blacklisted.`);
    } else if (action === "Verify") {
      await api.updateCompany(company.id, { status: "Verified" });
      toast.success(`${company.name} verified.`);
    } else {
      const name = window.prompt("Company name", company.name);
      if (name) await api.updateCompany(company.id, { name });
      toast.success(`${company.name} updated.`);
    }
    onChange();
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {rows.map((row) => (
        <Card key={row.id} className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant={status === "Verified" ? "outline" : "destructive"}>{status}</Badge>
          </div>
          <h2 className="font-semibold">{row.name}</h2>
          <p className="text-sm text-muted-foreground">{row.domain || "No domain"}</p>
          <p className="mt-3 text-xs text-muted-foreground">Last checked: {row.last_checked}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action}
                size="sm"
                variant={action === "Delete" ? "destructive" : "outline"}
                onClick={() => runAction(row, action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
