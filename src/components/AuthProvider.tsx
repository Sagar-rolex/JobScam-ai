import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";

export type Role = "guest" | "user" | "admin";

export type AuthUser = {
  id?: string;
  role: Exclude<Role, "guest">;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  course?: string;
  photo?: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  role: Role;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const STORAGE_KEY = "scamshield.auth.user";
const REGISTERED_USERS_KEY = "scamshield.auth.registered";

const AuthContext = createContext<AuthContextValue | null>(null);

const demoUser: AuthUser = {
  id: "demo-user",
  role: "user",
  name: "Aarav Sharma",
  email: "student@internshield.com",
  phone: "+91 98765 43210",
  college: "National Institute of Technology",
  course: "B.Tech Computer Science",
  photo: "AS",
};

const demoAdmin: AuthUser = {
  id: "local-admin",
  role: "admin",
  name: "InternShield Admin",
  email: "admin@internshield.com",
  phone: "+91 90000 00000",
  college: "Platform Operations",
  course: "Fraud Intelligence",
  photo: "IA",
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getRegisteredUsers(): RegisterInput[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) ?? "[]") as RegisterInput[];
  } catch {
    return [];
  }
}

function toLocalUser(input: RegisterInput): AuthUser {
  return {
    id: `local-${input.email}`,
    role: "user",
    name: input.name,
    email: input.email,
    photo: input.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? "guest",
      loading,
      login: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        const cleanEmail = normalizeEmail(email);
        const cleanPassword = password.trim();

        if (cleanEmail === demoAdmin.email && cleanPassword === "admin123") {
          persist(demoAdmin);
          toast.success("Admin login successful.");
          return true;
        }

        try {
          const { user: next } = await api.login(cleanEmail, cleanPassword);
          if (next.role === "admin") {
            persist(next);
            toast.success("Admin login successful.");
            return true;
          }
          if (next.role !== "user") return false;
          persist(next);
          toast.success("Login successful. Welcome back.");
          return true;
        } catch {
          const registered = getRegisteredUsers().find((u) => u.email.toLowerCase() === cleanEmail);
          const validDemo = cleanEmail === demoUser.email && cleanPassword === "student123";
          const validRegistered = registered && registered.password === cleanPassword;
          if (!validDemo && !validRegistered) {
            toast.error("Invalid credentials. Try student@internshield.com / student123.");
            return false;
          }
          persist(registered ? toLocalUser(registered) : demoUser);
          toast.success("Login successful. Running in local fallback mode.");
          return true;
        }
      },
      register: async (input) => {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const users = getRegisteredUsers().filter(
          (u) => u.email.toLowerCase() !== input.email.toLowerCase(),
        );
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify([...users, input]));
        try {
          await api.register(input);
          toast.success("Account created successfully.");
        } catch {
          toast.success("Account created successfully in local fallback mode.");
        }
      },
      adminLogin: async (email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 850));
        const cleanEmail = normalizeEmail(email);
        const cleanPassword = password.trim();

        if (cleanEmail === demoAdmin.email && cleanPassword === "admin123") {
          persist(demoAdmin);
          toast.success("Admin login successful.");
          return true;
        }

        try {
          const { user: next } = await api.adminLogin(cleanEmail, cleanPassword);
          if (next.role !== "admin") return false;
          persist(next);
          toast.success("Admin login successful.");
          return true;
        } catch {
          toast.error("Invalid admin credentials. Use admin@internshield.com / admin123.");
          return false;
        }
      },
      logout: () => {
        persist(null);
        toast.info("You have been logged out.");
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function ProtectedRoute({
  role,
  children,
}: {
  role: "user" | "admin";
  children: React.ReactNode;
}) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth.user) return <Navigate to="/login" />;
  if (auth.role !== role) return <Navigate to="/unauthorized" />;
  return <>{children}</>;
}

export function UnauthorizedPanel() {
  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
      <Card className="glass max-w-md p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Unauthorized Access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This area is protected. Please sign in with an account that has the required permissions.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <a href="/login">User Login</a>
          </Button>
          <Button asChild>
            <a href="/admin-login">Admin Login</a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
