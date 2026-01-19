"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import MagneticButton from "@/components/MagneticButton";

type Mode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Invite-only signup
  const [hasInvite, setHasInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // For now: UI only.
    // Later: call backend endpoint (login/signup) + redirect to dashboard
    console.log({ mode, email, password, inviteCode });
  }

  const signupLocked = !hasInvite;

  return (
    <section id="auth" className="relative z-[2] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left copy */}
            <div className="lg:col-span-5">
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Enter UniVerse.
              </h2>
              <p className="mt-3 text-muted leading-relaxed max-w-xl">
                Login if you already have an account. New accounts are provisioned
                by your institution to keep access secure and role-scoped.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
                <span className="glass rounded-full px-3 py-2">JWT-based auth</span>
                <span className="glass rounded-full px-3 py-2">
                  RBAC enforced server-side
                </span>
                <span className="glass rounded-full px-3 py-2">
                  AI sees only scoped data
                </span>
              </div>
            </div>

            {/* Right auth card */}
            <div className="lg:col-span-7">
              <div className="card rounded-[2.25rem] p-6 md:p-8">
                {/* Toggle */}
                <div className="flex items-center gap-2 rounded-2xl glass p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`px-4 py-2 rounded-2xl text-sm transition ${
                      mode === "login"
                        ? "bg-white text-black"
                        : "text-muted hover:text-white"
                    }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    disabled={signupLocked}
                    className={`px-4 py-2 rounded-2xl text-sm transition ${
                      mode === "signup"
                        ? "bg-white text-black"
                        : signupLocked
                        ? "text-white/30 cursor-not-allowed"
                        : "text-muted hover:text-white"
                    }`}
                    title={signupLocked ? "Invite required" : "Create account"}
                  >
                    Create account
                  </button>
                </div>

                {/* Invite-only helper row */}
                <div className="mt-3 text-xs text-muted">
                  <button
                    type="button"
                    onClick={() => {
                      setHasInvite(true);
                      setMode("signup");
                    }}
                    className="underline underline-offset-4 hover:text-white transition"
                  >
                    Have an invite?
                  </button>
                  <span className="ml-2 text-white/40">
                    Account creation is institution-controlled.
                  </span>
                </div>

                <div className="mt-6">
                  <div className="text-lg font-semibold tracking-tight">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {mode === "login"
                      ? "Login to access your dashboard."
                      : "Enter your invite code to create your account."}
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  {/* Invite Code (signup only) */}
                  {mode === "signup" && (
                    <div>
                      <label className="text-xs text-muted">Invite Code</label>
                      <input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        type="text"
                        required
                        placeholder="UNIV-XXXX-XXXX"
                        className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/25 transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      placeholder="you@university.edu"
                      className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/25 focus:bg-white/7 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted">Password</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      placeholder="••••••••"
                      className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/25 focus:bg-white/7 transition"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <MagneticButton className="bg-white text-black hover:bg-white/90 px-6 py-3 w-full sm:w-auto">
                      {mode === "login" ? "Login" : "Create account"}
                    </MagneticButton>

                    <MagneticButton
                      className="glass hover:bg-white/10 px-6 py-3 w-full sm:w-auto"
                      onClick={() => alert("We’ll wire this next.")}
                    >
                      {mode === "login" ? "Forgot password" : "Need help?"}
                    </MagneticButton>
                  </div>

                  <div className="text-xs text-muted pt-2">
                    By continuing, you agree to UniVerse usage policies.
                  </div>
                </form>
              </div>

              {/* Tiny note */}
              <div className="mt-4 text-xs text-muted">
                Note: In production, accounts are typically provisioned by the admin or via SSO.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
