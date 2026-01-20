"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <section className="relative z-2 pt-32 md:pt-40">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs text-muted">
            <span className="h-2 w-2 rounded-full bg-white/60" />
            Lightweight alternative to enterprise academic ERPs — built modern.
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                The Academic OS for modern universities.
                <span className="text-white/70"> Powered by AI.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 text-base md:text-lg text-muted leading-relaxed max-w-2xl">
                UniVerse centralizes attendance, internal marks, results, timetables, and notices with strict RBAC —
                plus an AI academic assistant for secure, natural-language insights.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <MagneticButton className="bg-white text-black hover:bg-white/90 px-6 py-3">
                  Get a Demo
                </MagneticButton>
                <MagneticButton className="glass hover:bg-white/10 px-6 py-3">
                  See Features
                </MagneticButton>
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted">
                <span className="glass rounded-full px-3 py-2">RBAC-first</span>
                <span className="glass rounded-full px-3 py-2">Department + Semester scoped</span>
                <span className="glass rounded-full px-3 py-2">AI summarization only</span>
                <span className="glass rounded-full px-3 py-2">Production-ready architecture</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.08}>
              <motion.div
                className="card rounded-3xl p-5 overflow-hidden"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Live Snapshot</div>
                  <div className="text-xs text-muted">CSE • Sem 4</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    ["Attendance", "82%"],
                    ["Defaulters", "14"],
                    ["Avg Score", "7.8/10"],
                    ["Notices", "3 new"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-2xl glass p-4">
                      <div className="text-xs text-muted">{k}</div>
                      <div className="mt-1 text-2xl font-semibold tracking-tight">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl glass p-4">
                  <div className="text-xs text-muted">AI Assistant</div>
                  <div className="mt-2 text-sm leading-relaxed">
                    “Generate performance summary for CSE Semester 4.”
                  </div>
                  <div className="mt-3 text-xs text-muted">
                    ✅ Authorized data fetched → ✅ summarized → ✅ explained
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
