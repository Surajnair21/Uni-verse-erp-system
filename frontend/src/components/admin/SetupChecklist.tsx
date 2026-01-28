"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SetupChecklist({
  stats,
}: {
  stats: {
    departments: number;
    programs: number;
    courses: number;
    subjects: number;
    semesters: number;
    sections: number;
  };
}) {
  const steps = [
    { key: "departments", label: "Create Departments", done: stats.departments > 0 },
    { key: "programs", label: "Create Programs", done: stats.programs > 0 },
    { key: "courses", label: "Create Courses", done: stats.courses > 0 },
    { key: "subjects", label: "Create Subjects", done: stats.subjects > 0 },
    { key: "semesters", label: "Create Semesters", done: stats.semesters > 0 },
    { key: "sections", label: "Create Sections", done: stats.sections > 0 },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_260px]">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Setup Progress</div>
            <div className="text-xs text-slate-600 mt-1">
              Finish these once. Everything else depends on this structure.
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-semibold text-slate-900">{pct}%</div>
            <div className="text-xs text-slate-600">{doneCount}/{steps.length} complete</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {steps.map((s, idx) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-400" />
                )}
                <div className="text-sm text-slate-800">{s.label}</div>
              </div>

              <div className="text-xs text-slate-600">
                {s.done ? "Done" : "Pending"}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4">
          <Link
            href="/admin/master"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600 transition"
          >
            Go to Master Data <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-sky-50 border border-slate-200 shadow-sm p-4">
        <div className="text-sm font-semibold text-slate-900">JKLU Context</div>
        <div className="mt-2 text-xs text-slate-700 leading-relaxed">
          Build the academic tree first (Dept → Program → Course → Semester → Section).
          Once ready, we’ll add attendance, IA marks, results, and analytics.
        </div>
        <div className="mt-3 text-xs text-slate-600">
          Jaipur campus workflow focus.
        </div>
      </div>
    </div>
  );
}
