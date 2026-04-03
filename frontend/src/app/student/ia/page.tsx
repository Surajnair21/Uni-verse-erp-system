"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, ClipboardX } from "lucide-react";

const TYPE_COLOR: Record<string, string> = {
  QUIZ:       "bg-sky-100 text-sky-700 border-sky-200",
  ASSIGNMENT: "bg-purple-100 text-purple-700 border-purple-200",
  MIDTERM:    "bg-orange-100 text-orange-700 border-orange-200",
  PROJECT:    "bg-teal-100 text-teal-700 border-teal-200",
  PRACTICAL:  "bg-rose-100 text-rose-700 border-rose-200",
};

type SubjectGroup = {
  subject: { id: string; name: string; code: string };
  components: Array<{
    id: string; name: string; type: string;
    maxMarks: number; marksObtained: number; percentage: string;
  }>;
};

export default function StudentIAPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups]   = useState<SubjectGroup[]>([]);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    apiFetch<SubjectGroup[]>("/api/ia/my-marks")
      .then(data => setGroups(data || []))
      .catch(e => setError(e.message || "Failed to load IA marks"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell
        role="STUDENT"
        pageTitle="My IA Marks"
        pageSubtitle="View your Internal Assessment scores subject-wise."
      >
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4 text-sm font-medium">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-5">
                {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />)}
              </motion.div>
            ) : groups.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <ClipboardX className="w-12 h-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium text-slate-700">No IA marks available yet.</p>
                <p className="text-sm mt-1">Your faculty hasn't entered any marks for you yet.</p>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="space-y-6">
                {groups.map((group, gi) => {
                  const avg = group.components.length > 0
                    ? group.components.reduce((acc, c) => acc + Number(c.percentage || 0), 0) / group.components.length
                    : 0;
                  return (
                    <motion.div key={group.subject.id}
                      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: gi * 0.05 }}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"
                    >
                      {/* Subject Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 rounded-xl">
                            <BarChart2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{group.subject.name}</h3>
                            <p className="text-xs text-slate-500">{group.subject.code}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-bold px-3 py-1 rounded-xl border ${avg >= 75 ? "bg-green-50 text-green-700 border-green-200" : avg >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          Avg {avg.toFixed(1)}%
                        </div>
                      </div>

                      {/* Component Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.components.map((comp, ci) => {
                          const pct = Number(comp.percentage || 0);
                          const isSafe = pct >= 75, isWarn = pct >= 50;
                          const barColor = isSafe ? "bg-green-500" : isWarn ? "bg-amber-500" : "bg-red-500";

                          return (
                            <motion.div key={comp.id}
                              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: ci * 0.05 }}
                              className="border border-slate-100 rounded-2xl p-4 bg-slate-50/80 flex flex-col gap-3"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${TYPE_COLOR[comp.type] || "bg-slate-100 text-slate-600"}`}>
                                    {comp.type}
                                  </span>
                                  <p className="font-semibold text-slate-800 mt-1.5">{comp.name}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-2xl font-black text-slate-900">{comp.marksObtained}</span>
                                  <span className="text-sm text-slate-400">/{comp.maxMarks}</span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, pct)}%` }}
                                    transition={{ duration: 0.9, ease: "easeOut" }}
                                    className={`h-full rounded-full ${barColor}`}
                                  />
                                </div>
                                <p className={`text-xs font-semibold ${isSafe ? "text-green-600" : isWarn ? "text-amber-600" : "text-red-600"}`}>
                                  {pct.toFixed(1)}%
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardShell>
    </Protected>
  );
}
