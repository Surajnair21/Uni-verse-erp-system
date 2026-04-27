"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, ListChecks } from "lucide-react";
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
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_280px]">
      {/* Checklist */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Setup Progress</h3>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-slate-900">{pct}%</span>
            <span className="text-xs text-slate-500 ml-1.5">{doneCount}/{steps.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
            />
          </div>
        </div>

        <div className="p-5 pt-3 space-y-2">
          {steps.map((s, idx) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition ${
                s.done
                  ? "bg-emerald-50/80 border border-emerald-100"
                  : "bg-slate-50 border border-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {s.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300" />
                )}
                <span className={`text-sm ${s.done ? "text-emerald-700 font-medium" : "text-slate-600"}`}>
                  {s.label}
                </span>
              </div>
              <span className={`text-xs font-semibold ${s.done ? "text-emerald-600" : "text-slate-400"}`}>
                {s.done ? "Done" : "Pending"}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <Link
            href="/admin/master"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            Go to Master Data <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Context Card */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100/50 shadow-sm p-5">
        <div className="text-sm font-bold text-slate-800">JKLU Workflow</div>
        <div className="mt-3 text-xs text-slate-600 leading-relaxed">
          Build the academic tree first:
        </div>
        <div className="mt-2 space-y-1.5">
          {["Department", "Program", "Course", "Semester", "Section"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 text-xs text-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] font-bold text-indigo-600 border border-indigo-100 shadow-sm">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Once set up, you can manage attendance, IA marks, and results.
        </p>
      </div>
    </div>
  );
}
