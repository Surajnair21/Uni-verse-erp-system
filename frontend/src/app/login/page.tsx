"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

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

function Stars() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 3) * 100,
    y: seededRandom(i * 3 + 1) * 100,
    size: seededRandom(i * 3 + 2) * 1.6 + 0.3,
    delay: seededRandom(i * 7) * 5,
    dur: seededRandom(i * 7 + 1) * 3 + 2,
  }));

  if (!isClient) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`, borderRadius: "50%", background: "white",
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #03040A; color: #E8EAF0; font-family: 'DM Sans', sans-serif; overflow: hidden; }

        @keyframes twinkle { 0%,100% { opacity:0.12; transform:scale(1); } 50% { opacity:0.85; transform:scale(1.4); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-16px); } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.8); } }
        @keyframes orbit1 { from { transform:rotate(0deg) translateX(160px) rotate(0deg); } to { transform:rotate(360deg) translateX(160px) rotate(-360deg); } }
        @keyframes orbit2 { from { transform:rotate(0deg) translateX(240px) rotate(0deg); } to { transform:rotate(-360deg) translateX(240px) rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .login-card { animation: fadeInUp 0.7s ease both; }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .field-input:focus {
          border-color: rgba(79,142,247,0.6);
          background: rgba(79,142,247,0.06);
          box-shadow: 0 0 0 3px rgba(79,142,247,0.1);
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
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(79,142,247,0.25);
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 0 50px rgba(79,142,247,0.45);
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .show-hide-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3);
          font-size: 13px; padding: 4px; transition: color 0.2s;
        }
        .show-hide-btn:hover { color: rgba(255,255,255,0.7); }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .role-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 6px 10px; font-size: 11px; color: rgba(255,255,255,0.45);
          transition: all 0.2s; cursor: default;
        }
      `}</style>

      {/* Background */}
      <Stars />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-15%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.10) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)", animation: "float 11s ease-in-out infinite", animationDelay: "-4s" }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)", animation: "float 14s ease-in-out infinite", animationDelay: "-7s" }} />
      </div>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

      {/* Orbit decoration (top-right corner) */}
      <div style={{ position: "fixed", top: "8%", right: "8%", pointerEvents: "none", zIndex: 0 }} className="hide-on-small">
        <div style={{ position: "relative", width: 1, height: 1 }}>
          <div style={{ position: "absolute", width: 320, height: 320, top: -160, left: -160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", width: 480, height: 480, top: -240, left: -240, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.02)" }} />
          <div style={{ position: "absolute", top: 0, left: 0, animation: "orbit1 10s linear infinite" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F8EF7", boxShadow: "0 0 10px #4F8EF7", transform: "translate(-4px,-4px)" }} />
          </div>
          <div style={{ position: "absolute", top: 0, left: 0, animation: "orbit2 15s linear infinite" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 8px #8B5CF6", transform: "translate(-3px,-3px)" }} />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div className="login-card" style={{ width: "100%", maxWidth: 460 }}>

          {/* University header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            {/* JKLU Logo */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {/* Fallback gradient emblem if image fails */}
                  <img
                    src="/JKLU.jpg"
                    alt="JKLU Logo"
                    style={{ width: 64, height: 64, objectFit: "contain" }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement!;
                      parent.innerHTML = `<div style="width:64px;height:64px;border-radius:12px;background:linear-gradient(135deg,#4F8EF7,#8B5CF6);display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:22px;color:white">JK</div>`;
                    }}
                  />
                </div>
                {/* Glow ring */}
                <div style={{ position: "absolute", inset: -2, borderRadius: 22, background: "linear-gradient(135deg, rgba(79,142,247,0.4), rgba(139,92,246,0.4))", zIndex: -1, filter: "blur(8px)" }} />
              </div>
            </div>

            {/* University name */}
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(79,142,247,0.8)", fontFamily: "Syne, sans-serif" }}>JK Lakshmipat University</span>
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "white", letterSpacing: "-0.01em", lineHeight: 1.1, margin: "0 0 6px" }}>
              Uni<span style={{ background: "linear-gradient(135deg, #4F8EF7, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Verse</span> ERP
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>Sign in to your academic portal</p>
          </div>

          {/* Card */}
          <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 24, padding: 32, position: "relative", overflow: "hidden" }}>
            {/* Card top glow */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 300, height: 1, background: "linear-gradient(90deg, transparent, rgba(79,142,247,0.6), transparent)" }} />

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
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
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "email" ? "#4F8EF7" : "rgba(255,255,255,0.25)", transition: "color 0.2s", fontSize: 15 }}>✉</div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
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
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                  />
                  <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: focusedField === "password" ? "#4F8EF7" : "rgba(255,255,255,0.25)", transition: "color 0.2s", fontSize: 15 }}>🔒</div>
                  <button type="button" className="show-hide-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {err && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 10, padding: "10px 14px" }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 13, color: "#F87171" }}>{err}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="login-btn" style={{ marginTop: 4 }}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                    Signing in...
                  </span>
                ) : (
                  "Sign In →"
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 20px" }}>
              <div className="divider-line" />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap", letterSpacing: "0.08em" }}>ACCESS LEVELS</span>
              <div className="divider-line" />
            </div>

            {/* Role badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {[
                { role: "Student", dot: "#4F8EF7", icon: "👤" },
                { role: "Faculty", dot: "#8B5CF6", icon: "👨‍🏫" },
                { role: "HOD", dot: "#06B6D4", icon: "🏛️" },
                { role: "Admin", dot: "#F59E0B", icon: "⚙️" },
              ].map((r) => (
                <div key={r.role} className="role-badge">
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.dot, flexShrink: 0 }} />
                  <span>{r.icon} {r.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div style={{ textAlign: "center", marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
              🔒 Secured with JWT · Role-based access control
            </p>
            <a href="http://localhost:3001" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(79,142,247,0.8)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)" }}>
              ← Back to UniVerse home
            </a>
          </div>

        </div>
      </div>
    </>
  );
}