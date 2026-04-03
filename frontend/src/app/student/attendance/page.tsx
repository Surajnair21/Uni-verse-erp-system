"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ClipboardX, Activity, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SummaryRow = {
  subject: string;
  totalSessions: number;
  presentCount: number;
  percentage: string;
};

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<SummaryRow[]>("/api/attendance/me/summary");
        if (!mounted) return;
        setRows(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load attendance");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate global attendance stat
  const globalPct = rows.length > 0 
    ? rows.reduce((acc, row) => acc + Number(row.percentage || 0), 0) / rows.length 
    : 0;

  // Subjects below the 75% threshold
  const atRisk = rows.filter(r => Number(r.percentage || 0) < 75);

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell
        role="STUDENT"
        pageTitle="My Attendance"
        pageSubtitle="Track your presence across all enrolled subjects."
      >
        <div className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-900 rounded-2xl px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-3 font-medium">
                <ClipboardX className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* ⚠️ Shortage Alert Banner */}
          {!loading && atRisk.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                Attendance Shortage Warning — {atRisk.length} subject{atRisk.length > 1 ? "s" : ""} below 75%
              </div>
              <div className="flex flex-wrap gap-2">
                {atRisk.map(r => (
                  <span key={r.subject}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                    {r.subject} — {Number(r.percentage).toFixed(1)}%
                  </span>
                ))}
              </div>
              <p className="text-xs text-red-600 mt-3">
                You need to attend more classes to avoid being debarred from exams. Minimum required: <strong>75%</strong>.
              </p>
            </motion.div>
          )}

          {!loading && rows.length > 0 && (
            <div className="bg-white border text-sm border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
               <div className="flex items-center gap-3 text-slate-700">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold">Overall Attendance Average:</span>
               </div>
               <span className={`text-lg font-bold px-3 py-1 rounded-xl ${
                 globalPct >= 75 ? "bg-green-100 text-green-700" :
                 globalPct >= 60 ? "bg-amber-100 text-amber-700" :
                 "bg-red-100 text-red-700"
               }`}>
                 {globalPct.toFixed(1)}%
               </span>
            </div>
          )}


          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl p-5 bg-slate-50 animate-pulse h-[140px]" />
                  ))}
                </motion.div>
              ) : rows.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col justify-center items-center py-20 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"
                >
                  <ClipboardX className="w-12 h-12 mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-700">No Attendance Records Yet</p>
                  <p className="text-sm mt-1 text-slate-500">Your faculty hasn't marked any attendance for your section yet.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {rows.map((r, i) => {
                    const pct = Number(r.percentage || 0);
                    
                    // Logic for progress bar color
                    const isSafe = pct >= 75;
                    const isWarning = pct >= 60 && pct < 75;
                    
                    const barColor = isSafe ? "bg-green-500" : isWarning ? "bg-amber-500" : "bg-red-500";
                    const bgLight = isSafe ? "bg-green-50" : isWarning ? "bg-amber-50" : "bg-red-50";
                    const textDark = isSafe ? "text-green-700" : isWarning ? "text-amber-700" : "text-red-700";

                    return (
                      <motion.div
                        key={r.subject}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-sky-200 transition-all bg-white relative overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-10 -mt-10 opacity-20 transition-colors ${bgLight}`} />
                        
                        <div className="flex items-start justify-between gap-4 relative z-10">
                          <h3 className="font-bold text-slate-900 leading-tight">
                            {r.subject}
                          </h3>
                        </div>

                        <div className="mt-6 flex items-center gap-6 relative z-10">
                          {/* Donut Chart */}
                          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                              <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-slate-100"
                              />
                              <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 40}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 - (Math.max(0, Math.min(100, pct)) / 100) * (2 * Math.PI * 40) }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                strokeLinecap="round"
                                className={isSafe ? "text-green-500" : isWarning ? "text-amber-500" : "text-red-500"}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className={`text-xl font-black ${textDark}`}>
                                {pct.toFixed(0)}<span className="text-sm font-bold">%</span>
                              </span>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="flex flex-col gap-3 justify-center text-sm font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`w-4 h-4 ${isSafe ? "text-green-500" : isWarning ? "text-amber-500" : "text-red-500"}`} />
                              <span><strong className="text-slate-900 text-base">{r.presentCount}</strong> Attended</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span><strong className="text-slate-900 text-base">{r.totalSessions}</strong> Total</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
