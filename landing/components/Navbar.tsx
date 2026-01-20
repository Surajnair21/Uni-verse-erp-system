"use client";

import MagneticButton from "./MagneticButton";

export default function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3 glass">
          <div className="flex items-center gap-2">
            <img
              src="/logo.svg"
              alt="UniVerse logo"
              className="h-8 w-8 object-contain"
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">UniVerse</div>
              <div className="text-xs text-muted">Academic OS + AI</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#ai" className="hover:text-white transition">AI Assistant</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <a href="#auth" className="hover:text-white transition">Login / Sign up</a>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#auth">
              <MagneticButton className="glass px-4 py-2 hover:bg-white/10">
                <span className="text-sm">Login</span>
              </MagneticButton>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
