"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Antigravity from "./Antigravity";
import BlobCursor from './BlobCursor';

function roleHome(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "HOD") return "/hod";
  if (role === "FACULTY") return "/faculty";
  return "/student";
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login(email, password);
      const u = JSON.parse(localStorage.getItem("uv_user") || "null");
      router.replace(roleHome(u?.role || "STUDENT"));
    } catch (e: any) {
      setErr(e?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    
  <BlobCursor
    blobType="circle"
    fillColor="#5227FF"
    trailCount={3}
    sizes={[60,125,75]}
    innerSizes={[20,35,25]}
    innerColor="rgba(255,255,255,0.8)"
    opacities={[0.6,0.6,0.6]}
    shadowColor="rgba(0,0,0,0.75)"
    shadowBlur={5}
    shadowOffsetX={10}
    shadowOffsetY={10}
    filterStdDeviation={30}
    useFilter={true}
    fastDuration={0.1}
    slowDuration={0.5}
    zIndex={5}
  />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body {
          background: #03040A;
          color: #E8EAF0;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.8); }
        }
        @keyframes orbit1 {
          from { transform: rotate(0deg)   translateX(160px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(0deg)    translateX(240px) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(240px) rotate(360deg); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }

        .login-card {
          animation: fadeInUp 0.75s cubic-bezier(0.22,1,0.36,1) both;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.22); }
        .field-input:focus {
          border-color: rgba(79,142,247,0.65);
          background: rgba(79,142,247,0.07);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.12);
        }

        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #4F8EF7, #8B5CF6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          transition: box-shadow 0.3s, transform 0.2s, opacity 0.2s;
          box-shadow: 0 0 28px rgba(79,142,247,0.28);
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 52px rgba(79,142,247,0.50);
          transform: translateY(-2px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .show-hide-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.28);
          font-size: 12px; padding: 4px 2px;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
          letter-spacing: 0.04em;
        }
        .show-hide-btn:hover { color: rgba(255,255,255,0.65); }

        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

        .role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 5px 10px;
          font-size: 11px; color: rgba(255,255,255,0.42);
          transition: border-color 0.2s, color 0.2s;
          cursor: default;
        }
        .role-badge:hover {
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.65);
        }

        /* keep card above the canvas */
        .login-z { position: relative; z-index: 20; }
      `}</style>

      {/* ── ANTIGRAVITY FULL-SCREEN BACKGROUND ── */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        /* soft vignette so edges don't distract from the card */
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(3,4,10,0.72) 100%)",
        pointerEvents: "none",
      }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        {mounted && (
          <Antigravity
            count={320}
            magnetRadius={7}
            ringRadius={8}
            waveSpeed={0.35}
            waveAmplitude={1.1}
            particleSize={1.4}
            lerpSpeed={0.05}
            color="#4F8EF7"
            autoAnimate
            particleVariance={1.2}
            rotationSpeed={0.4}
            depthFactor={1.2}
            pulseSpeed={2.8}
            particleShape="capsule"
            fieldStrength={11}
          />
        )}
      </div>

      {/* subtle grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />

      {/* floating orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-18%", left: "-12%", width: 550, height: 550, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%",  width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", animation: "float 12s ease-in-out infinite", animationDelay: "-5s" }} />
      </div>

      {/* orbit rings top-right */}
      <div style={{ position: "fixed", top: "7%", right: "7%", pointerEvents: "none", zIndex: 2 }}>
        <div style={{ position: "relative", width: 1, height: 1 }}>
          {[320, 480].map((d, i) => (
            <div key={d} style={{ position: "absolute", width: d, height: d, top: -d/2, left: -d/2, borderRadius: "50%", border: `1px solid rgba(255,255,255,0.0${i+2})` }} />
          ))}
          <div style={{ position: "absolute", top: 0, left: 0, animation: "orbit1 10s linear infinite" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 10px #4F8EF7", transform: "translate(-4px,-4px)" }} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, animation: "orbit2 16s linear infinite" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 8px #8B5CF6", transform: "translate(-3px,-3px)" }} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="login-z" style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 20,
      }}>
        <div className="login-card" style={{ width: "100%", maxWidth: 460 }}>

          {/* University header */}
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: 82, height: 82, borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backdropFilter: "blur(12px)",
                }}>
                  <img
                    src="/JKLU.jpg"
                    alt="JKLU Logo"
                    style={{ width: 66, height: 66, objectFit: "contain" }}
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      t.style.display = "none";
                      t.parentElement!.innerHTML = `<div style="width:66px;height:66px;border-radius:14px;background:linear-gradient(135deg,#4F8EF7,#8B5CF6);display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:24px;color:white">JK</div>`;
                    }}
                  />
                </div>
                {/* glow halo */}
                <div style={{ position: "absolute", inset: -3, borderRadius: 24, background: "linear-gradient(135deg, rgba(79,142,247,0.35), rgba(139,92,246,0.35))", zIndex: -1, filter: "blur(10px)" }} />
              </div>
            </div>

            <span style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(79,142,247,0.85)", fontFamily: "Syne, sans-serif", marginBottom: 7 }}>
              JK Lakshmipat University
            </span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 30, color: "white", letterSpacing: "-0.015em", lineHeight: 1.1, margin: "0 0 7px" }}>
              Uni<span style={{ background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Verse</span> ERP
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.36)", margin: 0 }}>
              Sign in to your academic portal
            </p>
          </div>

          {/* Glass card */}
          <div style={{
            background: "rgba(8,10,20,0.65)",
            backdropFilter: "blur(48px)",
            WebkitBackdropFilter: "blur(48px)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 24,
            padding: 32,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}>
            {/* top shimmer line */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 280, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.7), transparent)" }} />

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="field-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@jklu.edu.in"
                    style={{ paddingLeft: 42 }}
                  />
                  <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: focusedField === "email" ? "#4F8EF7" : "rgba(255,255,255,0.22)", transition: "color 0.2s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="field-input"
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    style={{ paddingLeft: 42, paddingRight: 52 }}
                  />
                  <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: focusedField === "password" ? "#4F8EF7" : "rgba(255,255,255,0.22)", transition: "color 0.2s" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <button type="button" className="show-hide-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {err && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(244,63,94,0.09)", border: "1px solid rgba(244,63,94,0.28)", borderRadius: 10, padding: "10px 14px" }}>
                  <svg style={{ width: 16, height: 16, color: "#F87171", flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{ fontSize: 13, color: "#F87171" }}>{err}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="login-btn" style={{ marginTop: 4 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.28)", borderTopColor: "white", animation: "spin 0.75s linear infinite", display: "inline-block" }} />
                    Signing in...
                  </span>
                ) : "Sign In →"}
              </button>
            </form>

            {/* Divider + roles */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 18px" }}>
              <div className="divider-line" />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase" }}>Access Levels</span>
              <div className="divider-line" />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {[
                { role: "Student",  dot: "#4F8EF7", icon: "👤" },
                { role: "Faculty",  dot: "#8B5CF6", icon: "👨‍🏫" },
                { role: "HOD",      dot: "#06B6D4", icon: "🏛️" },
                { role: "Admin",    dot: "#F59E0B", icon: "⚙️" },
              ].map((r) => (
                <div key={r.role} className="role-badge">
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
                  {r.icon} {r.role}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.17)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg style={{ width: 12, height: 12 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Secured with JWT · Role-based access control
            </p>
            <a href="http://localhost:3001"
              style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(79,142,247,0.85)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.22)" }}>
              ← Back to UniVerse home
            </a>
          </div>

        </div>
      </div>
    </>
  );
}