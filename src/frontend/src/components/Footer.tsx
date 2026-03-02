import { Link } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border bg-card/60 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">
              Study<span className="text-primary">Share</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              My Library
            </Link>
          </nav>

          {/* Attribution */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            © {year}. Built with{" "}
            <Heart className="w-3 h-3 text-destructive fill-destructive" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
