"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, BarChart2, ClipboardCheck, ChevronRight, Loader2 } from "lucide-react";

const DEPT_COLORS = [
  "from-sky-50 to-indigo-50 border-sky-200",
  "from-orange-50 to-rose-50 border-orange-200",
  "from-teal-50 to-green-50 border-teal-200",
  "from-purple-50 to-violet-50 border-purple-200",
];

export default function FacultyAllocationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Backend scopes this to the logged-in faculty automatically
        const al = await apiFetch<any[]>("/api/allocations");
        setRows(al || []);
      } finally {
        setLoading(false);
      }
    }
    load().catch(() => {});
  }, []);

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell
        role="FACULTY"
        pageTitle="My Classes"
        pageSubtitle={`${rows.length} teaching assignment${rows.length !== 1 ? "s" : ""} across your subjects and sections.`}
      >
        <div className="space-y-5">
          {loading ? (
            <div className="flex items-center gap-3 text-slate-500 p-6">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading your classes...
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500">
              <BookOpen className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-lg font-medium text-slate-700">No classes allocated yet.</p>
              <p className="text-sm mt-1">Ask Admin to assign you subjects and sections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rows.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative rounded-2xl border bg-gradient-to-br p-5 hover:shadow-md transition-all ${DEPT_COLORS[i % DEPT_COLORS.length]}`}
                >
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                        {a.section?.department?.code} • Sem {a.section?.semester?.number}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">{a.subject?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{a.subject?.code}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-800">
                        Section {a.section?.name}
                      </p>
                      <p className="text-xs text-slate-500">Batch {a.section?.batchYear}</p>
                    </div>
                  </div>

                  {/* Quick Action Links */}
                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/faculty/attendance`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl bg-white/80 border border-slate-200 hover:bg-white hover:shadow-sm transition text-slate-700"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5 text-sky-500" />
                      Attendance
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </Link>
                    <Link
                      href={`/faculty/ia`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-xl bg-white/80 border border-slate-200 hover:bg-white hover:shadow-sm transition text-slate-700"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                      IA Marks
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DashboardShell>
    </Protected>
  );
}
