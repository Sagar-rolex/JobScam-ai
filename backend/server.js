import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";

import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "./backend/.env" });

import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

// ---------- Seed data (runs once, only if `users` table is empty) ----------
async function seed() {
  const { count, error: countError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Seed check failed:", countError.message);
    return;
  }
  if (count > 0) return;

  const users = [
    {
      id: "admin-1",
      name: "InternShield Admin",
      email: "admin@internshield.com",
      password_hash: hashPassword("admin123"),
      role: "admin",
      phone: "+91 90000 00000",
      college: "Platform Operations",
      course: "Fraud Intelligence",
      status: "Active",
    },
    {
      id: "user-1",
      name: "Aarav Sharma",
      email: "student@internshield.com",
      password_hash: hashPassword("student123"),
      role: "user",
      phone: "+91 98765 43210",
      college: "National Institute of Technology",
      course: "B.Tech Computer Science",
      status: "Active",
    },
    {
      id: "user-2",
      name: "Priya Iyer",
      email: "priya@college.edu",
      password_hash: hashPassword("student123"),
      role: "user",
      phone: "",
      college: "IIT Madras",
      course: "B.Tech IT",
      status: "Active",
    },
    {
      id: "user-3",
      name: "Rahul Verma",
      email: "rahul@college.edu",
      password_hash: hashPassword("student123"),
      role: "user",
      phone: "",
      college: "VIT",
      course: "BCA",
      status: "Review",
    },
  ];

  const reports = [
    {
      id: "report-1",
      company: "FastCash Hiring",
      reporter: "Nisha Rao",
      date: "2026-07-12",
      status: "Pending",
      risk_level: "High",
      details: "Asked for registration fee.",
    },
    {
      id: "report-2",
      company: "BrightCareer Hub",
      reporter: "Rahul Mehta",
      date: "2026-07-11",
      status: "Review",
      risk_level: "Medium",
      details: "No official website.",
    },
    {
      id: "report-3",
      company: "WorkFromHome India Ltd",
      reporter: "Sara Khan",
      date: "2026-07-10",
      status: "Approved",
      risk_level: "High",
      details: "WhatsApp-only hiring.",
    },
  ];

  const companies = [
    {
      id: "company-1",
      name: "TechNova Labs",
      domain: "technova.example",
      status: "Verified",
      reports: 0,
      last_checked: "2026-07-12",
    },
    {
      id: "company-2",
      name: "CampusEdge AI",
      domain: "campusedge.example",
      status: "Verified",
      reports: 1,
      last_checked: "2026-07-10",
    },
    {
      id: "company-3",
      name: "FastCash Hiring",
      domain: "gmail recruiter",
      status: "Blacklisted",
      reports: 142,
      last_checked: "2026-07-12",
    },
    {
      id: "company-4",
      name: "WorkFromHome India Ltd",
      domain: "unknown",
      status: "Blacklisted",
      reports: 88,
      last_checked: "2026-07-09",
    },
  ];

  const { error: usersErr } = await supabase.from("users").insert(users);
  if (usersErr) console.error("Seed users failed:", usersErr.message);

  const { error: reportsErr } = await supabase.from("scam_reports").insert(reports);
  if (reportsErr) console.error("Seed reports failed:", reportsErr.message);

  const { error: companiesErr } = await supabase.from("companies").insert(companies);
  if (companiesErr) console.error("Seed companies failed:", companiesErr.message);
}

await seed();

// ---------- HTTP helpers ----------
function send(res, status, body) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    phone: row.phone,
    college: row.college,
    course: row.course,
    status: row.status,
    photo: row.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

// ---------- Server ----------
const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const method = req.method ?? "GET";

  if (method === "OPTIONS") return send(res, 200, { ok: true });

  try {
    if (method === "GET" && url.pathname === "/api/health") {
      return send(res, 200, { ok: true, database: "supabase" });
    }

    // ---- auth: register ----
    if (method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readJson(req);
      if (!body.name || !body.email || !body.password)
        return send(res, 400, { error: "Name, email, and password are required." });

      const id = randomUUID();
      const { error: insertErr } = await supabase.from("users").insert({
        id,
        name: body.name,
        email: body.email.toLowerCase(),
        password_hash: hashPassword(body.password),
        role: "user",
      });
      if (insertErr) return send(res, 400, { error: insertErr.message });

      const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 201, { user: publicUser(user) });
    }

    // ---- auth: login / admin-login ----
    if (
      method === "POST" &&
      (url.pathname === "/api/auth/login" || url.pathname === "/api/auth/admin-login")
    ) {
      const body = await readJson(req);
      const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("*")
        .eq("email", String(body.email ?? "").toLowerCase())
        .maybeSingle();

      if (fetchErr) return send(res, 500, { error: fetchErr.message });
      if (!user || user.password_hash !== hashPassword(String(body.password ?? "")))
        return send(res, 401, { error: "Invalid credentials." });
      if (url.pathname.endsWith("admin-login") && user.role !== "admin")
        return send(res, 403, { error: "Admin access required." });

      return send(res, 200, { user: publicUser(user) });
    }

    // ---- admin: list users ----
    if (method === "GET" && url.pathname === "/api/admin/users") {
      const { data: users, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { users: users.map(publicUser) });
    }

    // ---- admin: update / delete user ----
    const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (userMatch && method === "PATCH") {
      const body = await readJson(req);
      const updates = {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.name !== undefined) updates.name = body.name;

      const { error: updateErr } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userMatch[1]);
      if (updateErr) return send(res, 500, { error: updateErr.message });

      const { data: user, error: fetchErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", userMatch[1])
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 200, { user: publicUser(user) });
    }
    if (userMatch && method === "DELETE") {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userMatch[1])
        .neq("role", "admin");
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true });
    }

    // ---- reports: list / create ----
    if (method === "GET" && url.pathname === "/api/reports") {
      const { data: reports, error } = await supabase
        .from("scam_reports")
        .select("*")
        .order("date", { ascending: false });
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { reports });
    }

    if (method === "POST" && url.pathname === "/api/reports") {
      const body = await readJson(req);
      const id = randomUUID();
      const { error: insertErr } = await supabase.from("scam_reports").insert({
        id,
        company: body.company,
        reporter: body.reporter ?? "Anonymous",
        risk_level: body.riskLevel ?? "Medium",
        details: body.details ?? "",
      });
      if (insertErr) return send(res, 400, { error: insertErr.message });

      const { data: report, error: fetchErr } = await supabase
        .from("scam_reports")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 201, { report });
    }

    // ---- reports: update / delete ----
    const reportMatch = url.pathname.match(/^\/api\/reports\/([^/]+)$/);
    if (reportMatch && method === "PATCH") {
      const body = await readJson(req);
      const updates = {};
      if (body.status !== undefined) updates.status = body.status;
      if (body.riskLevel !== undefined) updates.risk_level = body.riskLevel;

      const { error: updateErr } = await supabase
        .from("scam_reports")
        .update(updates)
        .eq("id", reportMatch[1]);
      if (updateErr) return send(res, 500, { error: updateErr.message });

      const { data: report, error: fetchErr } = await supabase
        .from("scam_reports")
        .select("*")
        .eq("id", reportMatch[1])
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 200, { report });
    }
    if (reportMatch && method === "DELETE") {
      const { error } = await supabase.from("scam_reports").delete().eq("id", reportMatch[1]);
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true });
    }

    // ---- companies: list / create ----
    if (method === "GET" && url.pathname === "/api/companies") {
      const { data: companies, error } = await supabase
        .from("companies")
        .select("*")
        .order("status", { ascending: true })
        .order("name", { ascending: true });
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { companies });
    }

    if (method === "POST" && url.pathname === "/api/companies") {
      const body = await readJson(req);
      const id = randomUUID();
      const { error: insertErr } = await supabase.from("companies").insert({
        id,
        name: body.name,
        domain: body.domain ?? "",
        status: body.status ?? "Verified",
        reports: body.reports ?? 0,
      });
      if (insertErr) return send(res, 400, { error: insertErr.message });

      const { data: company, error: fetchErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 201, { company });
    }

    // ---- companies: update / delete ----
    const companyMatch = url.pathname.match(/^\/api\/companies\/([^/]+)$/);
    if (companyMatch && method === "PATCH") {
      const body = await readJson(req);
      const updates = { last_checked: new Date().toISOString() };
      if (body.name !== undefined) updates.name = body.name;
      if (body.domain !== undefined) updates.domain = body.domain;
      if (body.status !== undefined) updates.status = body.status;
      if (body.reports !== undefined) updates.reports = body.reports;

      const { error: updateErr } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", companyMatch[1]);
      if (updateErr) return send(res, 500, { error: updateErr.message });

      const { data: company, error: fetchErr } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyMatch[1])
        .single();
      if (fetchErr) return send(res, 500, { error: fetchErr.message });

      return send(res, 200, { company });
    }
    if (companyMatch && method === "DELETE") {
      const { error } = await supabase.from("companies").delete().eq("id", companyMatch[1]);
      if (error) return send(res, 500, { error: error.message });
      return send(res, 200, { ok: true });
    }

    // ---- analytics ----
    if (method === "GET" && url.pathname === "/api/analytics") {
      const [totalUsersRes, reportsPendingRes, verifiedCompaniesRes] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "user"),
        supabase
          .from("scam_reports")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending"),
        supabase
          .from("companies")
          .select("*", { count: "exact", head: true })
          .eq("status", "Verified"),
      ]);

      if (totalUsersRes.error) return send(res, 500, { error: totalUsersRes.error.message });
      if (reportsPendingRes.error)
        return send(res, 500, { error: reportsPendingRes.error.message });
      if (verifiedCompaniesRes.error)
        return send(res, 500, { error: verifiedCompaniesRes.error.message });

      return send(res, 200, {
        cards: {
          totalUsers: totalUsersRes.count ?? 0,
          jobsAnalyzed: 42318,
          scamsDetected: 12847,
          reportsPending: reportsPendingRes.count ?? 0,
          verifiedCompanies: verifiedCompaniesRes.count ?? 0,
        },
      });
    }

    return send(res, 404, { error: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return send(res, 500, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`InternShield API running at http://127.0.0.1:${PORT}`);
});
