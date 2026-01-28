"use client";

import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";

const prompts = [
  "What is my attendance in DBMS?",
  "Which students are below 75% attendance?",
  "Generate performance summary for CSE Semester 4",
  "Show recent notices for my department",
];

export default function AiAssistant() {
  return (
    <section id="ai" className="relative z-2 pt-20 md:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <Reveal>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
                AI that’s helpful — not reckless.
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                The assistant never hits your database directly. UniVerse fetches authorized data first,
                then uses AI only for summarization and natural-language explanation.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
                <span className="glass rounded-full px-3 py-2">No direct DB access</span>
                <span className="glass rounded-full px-3 py-2">RBAC enforced first</span>
                <span className="glass rounded-full px-3 py-2">Explainable outputs</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <div className="card rounded-3xl p-5">
                <div className="text-sm font-medium">Try asking:</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prompts.map((p, i) => (
                    <motion.div
                      key={p}
                      className="glass rounded-2xl p-4 text-sm text-white/90"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {p}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 glass rounded-2xl p-4 text-sm leading-relaxed">
                  <div className="text-xs text-muted">Flow</div>
                  <div className="mt-2">
                    Backend authorizes → fetches scoped data → AI summarizes → user gets insight.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
