import type { AuthUser } from "@/components/AuthProvider";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:4000/api").replace(/\/$/, "");

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "API request failed");
  return data;
}

export type ApiUser = AuthUser & {
  id: string;
  status?: string;
};

export type ApiReport = {
  id: string;
  company: string;
  reporter: string;
  date: string;
  status: string;
  risk_level: string;
  details?: string;
};

export type ApiCompany = {
  id: string;
  name: string;
  domain: string;
  status: "Verified" | "Blacklisted";
  reports: number;
  last_checked: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminLogin: (email: string, password: string) =>
    request<{ user: ApiUser }>("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (input: { name: string; email: string; password: string }) =>
    request<{ user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  users: () => request<{ users: ApiUser[] }>("/admin/users"),
  updateUser: (id: string, input: Partial<ApiUser>) =>
    request<{ user: ApiUser }>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteUser: (id: string) =>
    request<{ ok: boolean }>(`/admin/users/${id}`, {
      method: "DELETE",
    }),
  reports: () => request<{ reports: ApiReport[] }>("/reports"),
  updateReport: (id: string, input: { status?: string; riskLevel?: string }) =>
    request<{ report: ApiReport }>(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteReport: (id: string) =>
    request<{ ok: boolean }>(`/reports/${id}`, {
      method: "DELETE",
    }),
  companies: () => request<{ companies: ApiCompany[] }>("/companies"),
  updateCompany: (id: string, input: Partial<ApiCompany>) =>
    request<{ company: ApiCompany }>(`/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteCompany: (id: string) =>
    request<{ ok: boolean }>(`/companies/${id}`, {
      method: "DELETE",
    }),
};
