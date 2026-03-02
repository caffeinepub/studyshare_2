import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

export default function Navbar() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const { data: isAdmin } = useIsCallerAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (err: unknown) {
        const error = err as Error;
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { to: "/", label: "Browse", icon: <BookOpen className="w-4 h-4" /> },
    ...(isAuthenticated
      ? [
          {
            to: "/dashboard",
            label: "My Library",
            icon: <LayoutDashboard className="w-4 h-4" />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            to: "/upload",
            label: "Upload",
            icon: <Upload className="w-4 h-4" />,
          },
          {
            to: "/admin",
            label: "Admin",
            icon: <Settings className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-xs">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-teal">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground tracking-tight">
              Study<span className="text-primary">Share</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              size="sm"
              variant={isAuthenticated ? "outline" : "default"}
              className="hidden md:flex items-center gap-2"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isAuthenticated ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn
                ? "Connecting…"
                : isAuthenticated
                  ? "Sign Out"
                  : "Sign In"}
            </Button>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="container px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border">
                <Button
                  onClick={() => {
                    handleAuth();
                    setMobileOpen(false);
                  }}
                  disabled={isLoggingIn}
                  variant={isAuthenticated ? "outline" : "default"}
                  className="w-full flex items-center gap-2"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isAuthenticated ? (
                    <LogOut className="w-4 h-4" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  {isLoggingIn
                    ? "Connecting…"
                    : isAuthenticated
                      ? "Sign Out"
                      : "Sign In"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
