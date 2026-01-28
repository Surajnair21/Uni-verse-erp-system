"use client";

import { motion } from "framer-motion";
import { Building2, Layers3, BookOpen, Shapes, UsersRound } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";

export default function StatsGrid({
  stats,
}: {
  stats: {
    departments: number;
    programs: number;
    courses: number;
    subjects: number;
    sections: number;
  };
}) {
  const items = [
    { key: "departments", label: "Departments", value: stats.departments, icon: Building2, tone: "blue" },
    { key: "programs", label: "Programs", value: stats.programs, icon: Layers3, tone: "orange" },
    { key: "courses", label: "Courses", value: stats.courses, icon: BookOpen, tone: "blue" },
    { key: "subjects", label: "Subjects", value: stats.subjects, icon: Shapes, tone: "orange" },
    { key: "sections", label: "Sections", value: stats.sections, icon: UsersRound, tone: "blue" },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {items.map((it, idx) => {
        const Icon = it.icon;

        const ring = it.tone === "blue" ? "ring-sky-200" : "ring-orange-200";
        const badge =
          it.tone === "blue"
            ? "bg-sky-100 text-sky-700 border border-sky-200"
            : "bg-orange-100 text-orange-700 border border-orange-200";

        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <TiltCard className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md p-4 ring-1 ${ring}`}>
              {/* subtle shine */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-slate-200/40 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-slate-200/20 blur-2xl" />

              <div className="flex items-start justify-between">
                <div className={`inline-flex items-center gap-2 rounded-xl px-2.5 py-1 text-xs ${badge}`}>
                  <Icon className="h-4 w-4" />
                  {it.label}
                </div>
              </div>

              <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                {it.value}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Records available in master data
              </div>
            </TiltCard>
          </motion.div>
        );
      })}
    </div>
  );
}
