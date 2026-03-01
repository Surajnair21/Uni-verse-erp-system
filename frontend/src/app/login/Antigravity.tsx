"use client";

import { useEffect, useRef } from "react";

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: "circle" | "capsule" | "square";
  fieldStrength?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function Antigravity({
  count = 300,
  magnetRadius = 6,
  ringRadius = 7,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.5,
  lerpSpeed = 0.05,
  color = "#4F8EF7",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10,
}: AntigravityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    animId: number;
    mouse: { x: number; y: number };
    time: number;
    rotation: number;
    particles: {
      ox: number; oy: number;   // origin (home) position in canvas coords
      x: number;  y: number;   // current rendered position
      tx: number; ty: number;  // target position
      vx: number; vy: number;  // velocity for spring effect
      z: number;               // depth [0..1]
      phase: number;           // wave phase offset
      size: number;            // individual size
    }[];
  }>({ animId: 0, mouse: { x: -9999, y: -9999 }, time: 0, rotation: 0, particles: [] });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const S = stateRef.current;
    const [r, g, b] = hexToRgb(color);

    // ── resize ───────────────────────────────────────────────────────────────
    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }

    // ── init particles ───────────────────────────────────────────────────────
    function initParticles() {
      if (!canvas) return;
      const W = canvas.width;
      const H = canvas.height;
      S.particles = Array.from({ length: count }, (_, i) => {
        // scatter them randomly over the full canvas
        const ox = Math.random() * W;
        const oy = Math.random() * H;
        const z  = 0.3 + Math.random() * 0.7;          // depth
        const sz = (particleSize * (0.5 + particleVariance * z * 0.8)) * (0.6 + Math.random() * 0.8);
        return {
          ox, oy,
          x: ox, y: oy,
          tx: ox, ty: oy,
          vx: 0,  vy: 0,
          z,
          phase: (i / count) * Math.PI * 2 + Math.random() * Math.PI,
          size: sz,
        };
      });
    }

    // ── draw one particle ────────────────────────────────────────────────────
    function drawParticle(px: number, py: number, sz: number, alpha: number) {
      if (!ctx) return;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle   = `rgb(${r},${g},${b})`;

      if (particleShape === "circle") {
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      } else if (particleShape === "square") {
        ctx.fillRect(px - sz, py - sz, sz * 2, sz * 2);
      } else {
        // capsule — elongated pill
        const len = sz * 2.2;
        ctx.beginPath();
        ctx.roundRect(px - sz * 0.5, py - len * 0.5, sz, len, sz);
        ctx.fill();
      }
    }

    // ── main loop ────────────────────────────────────────────────────────────
    function loop() {
      if (!canvas || !ctx) return;
      S.animId = requestAnimationFrame(loop);

      const W = canvas.width;
      const H = canvas.height;
      S.time    += 0.016;
      S.rotation += rotationSpeed * 0.001;

      ctx.clearRect(0, 0, W, H);

      const pulse = 1 + Math.sin(S.time * pulseSpeed) * 0.08;

      for (const p of S.particles) {
        // ── wave / auto-animation offset ──
        let waveX = 0, waveY = 0;
        if (autoAnimate) {
          const t   = S.time * waveSpeed + p.phase;
          waveX = Math.sin(t * 1.3) * waveAmplitude * 4 * p.z;
          waveY = Math.cos(t * 0.9) * waveAmplitude * 4 * p.z;
        }

        // ── optional global rotation around canvas centre ──
        let homeX = p.ox, homeY = p.oy;
        if (rotationSpeed !== 0) {
          const cx = W * 0.5, cy = H * 0.5;
          const dx = p.ox - cx, dy = p.oy - cy;
          const ang = S.rotation;
          homeX = cx + dx * Math.cos(ang) - dy * Math.sin(ang);
          homeY = cy + dx * Math.sin(ang) + dy * Math.cos(ang);
        }

        // ── magnetic repulsion from mouse ──
        const mdx  = p.x - S.mouse.x;
        const mdy  = p.y - S.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        const repelRadius = magnetRadius * 30 * p.z;

        let repX = 0, repY = 0;
        if (mdist < repelRadius && mdist > 0.1) {
          const strength = ((repelRadius - mdist) / repelRadius) * fieldStrength * p.z;
          repX = (mdx / mdist) * strength * 6;
          repY = (mdy / mdist) * strength * 6;
        }

        // ── ring magnet — particles near the cursor orbit in a ring ──
        const ringR = ringRadius * 20 * p.z;
        let ringX = 0, ringY = 0;
        if (mdist < ringR * 2 && mdist > ringR * 0.5) {
          const angle = Math.atan2(mdy, mdx) + 0.05;
          ringX = (Math.cos(angle) * ringR - mdx) * 0.015;
          ringY = (Math.sin(angle) * ringR - mdy) * 0.015;
        }

        // ── target = home + wave + repel + ring ──
        p.tx = homeX + waveX + repX + ringX;
        p.ty = homeY + waveY + repY + ringY;

        // ── spring lerp ──
        const sp  = lerpSpeed * (0.7 + p.z * 0.6);
        p.vx = p.vx * 0.82 + (p.tx - p.x) * sp;
        p.vy = p.vy * 0.82 + (p.ty - p.y) * sp;
        p.x += p.vx;
        p.y += p.vy;

        // ── depth-based alpha + size ──
        const depth  = 0.3 + p.z * depthFactor * 0.7;
        const alpha  = depth * (0.5 + 0.5 * pulse);
        const sz     = p.size * pulse * depth;

        drawParticle(p.x, p.y, Math.max(0.3, sz), alpha);
      }

      ctx.globalAlpha = 1;
    }

    // ── mouse tracking ───────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      S.mouse.x = e.clientX - rect.left;
      S.mouse.y = e.clientY - rect.top;
    }
    function onMouseLeave() {
      S.mouse.x = -9999;
      S.mouse.y = -9999;
    }
    function onTouchMove(e: TouchEvent) {
      if (!canvas || !e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      S.mouse.x = e.touches[0].clientX - rect.left;
      S.mouse.y = e.touches[0].clientY - rect.top;
    }

    // ── boot ─────────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove",  onTouchMove, { passive: true });

    loop();

    return () => {
      cancelAnimationFrame(S.animId);
      ro.disconnect();
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove",  onTouchMove);
    };
  }, [
    count, magnetRadius, ringRadius, waveSpeed, waveAmplitude,
    particleSize, lerpSpeed, color, autoAnimate, particleVariance,
    rotationSpeed, depthFactor, pulseSpeed, particleShape, fieldStrength,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}