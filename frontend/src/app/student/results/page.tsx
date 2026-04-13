"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch, getToken, API_BASE } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, FileText, DownloadCloud } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudentResults() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const result = await apiFetch<any>("/api/results/my-results");
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell role="STUDENT" pageTitle="My Results" pageSubtitle="Academic performance and grades">
        {loading ? (
          <div className="space-y-4">
            <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        ) : !data || data.semesters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            No results have been published yet.
          </div>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg flex items-center justify-between"
            >
              <div>
                <div className="text-indigo-100 text-sm font-medium mb-1">Cumulative Grade Point Average</div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">{data.cgpa.toFixed(2)}</div>
                  {user && (
                    <a
                      href={`${API_BASE}/api/results/student/${user.id}/export?token=${getToken()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition"
                    >
                      <DownloadCloud className="w-4 h-4" /> Export Report
                    </a>
                  )}
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <div className="space-y-8">
              {data.semesters.map((sem: any, idx: number) => {
                const subs = data.subjects.filter((s: any) => s.semesterId === sem.semesterId);

                return (
                  <motion.div
                    key={sem.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Semester {sem.semester.number} ({sem.semester.course.code})
                      </div>
                      <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        SGPA: {sem.sgpa.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                          <tr>
                            <th className="px-5 py-3">Subject</th>
                            <th className="px-5 py-3 text-center">Credits</th>
                            <th className="px-5 py-3 text-center">Total Marks</th>
                            <th className="px-5 py-3 text-center">Grade</th>
                            <th className="px-5 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {subs.map((sub: any) => (
                            <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-5 py-3 font-medium text-slate-800">
                                {sub.subject.name} <span className="text-xs text-slate-400 font-normal">({sub.subject.code})</span>
                              </td>
                              <td className="px-5 py-3 text-center">{sub.subject.credits}</td>
                              <td className="px-5 py-3 text-center">{sub.totalMarks}</td>
                              <td className="px-5 py-3 text-center font-bold text-slate-800">
                                {sub.grade} <span className="text-[10px] text-slate-400 font-normal">({sub.gradePoint})</span>
                              </td>
                              <td className="px-5 py-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sub.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {sub.passed ? 'PASS' : 'FAIL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                      <div>Status: <span className={`font-bold ${sem.status === 'PASS' ? 'text-emerald-600' : 'text-red-600'}`}>{sem.status}</span></div>
                      <div>Credits Earned: {sem.earnedCredits} / {sem.totalCredits}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </DashboardShell>
    </Protected>
  );
}
