import { Link } from "@tanstack/react-router";
import { Shield, Moon, Sun, Menu, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/detect", label: "Detect" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/report", label: "Report" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Shield className="h-7 w-7 text-primary group-hover:animate-pulse-glow" />
            <div className="absolute inset-0 blur-lg bg-primary/40 -z-10" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            ScamShield<span className="text-gradient-cyber">.AI</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "bg-primary/15 text-primary" }}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="flex flex-col p-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-primary/15 text-primary" }}
                className="px-4 py-2 rounded-md text-sm font-medium hover:bg-muted"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
