"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserX, AlertCircle, ChevronRight, Mail } from "lucide-react";
import Link from "next/link";

export default function FlaggedStudentsPage() {
  const [flagged, setFlagged] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<any[]>("/api/attendance/flagged");
        // sort by percentage ascending (most critical first)
        const sorted = data.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage));
        setFlagged(sorted);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell 
        role="HOD" 
        pageTitle="Flagged Students" 
        pageSubtitle="Students with dangerously low attendance (< 75%)"
      >
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-red-50 border border-red-200 p-5 rounded-2xl text-red-800"
          >
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Action Required</h2>
              <p className="text-sm text-red-700">
                Found <span className="font-bold">{flagged.length}</span> students across your department dropping below the 75% attendance threshold. Contact their respective faculty advisors or sections.
              </p>
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : flagged.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700">All Clear</h3>
              <p className="text-slate-500 text-sm">No students in your department are currently below 75% attendance.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="col-span-4">Student</div>
                <div className="col-span-3">Section</div>
                <div className="col-span-3">Attendance</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {flagged.map((student, i) => (
                  <motion.div 
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition"
                  >
                    <div className="col-span-4">
                      <div className="font-semibold text-slate-900">{student.name}</div>
                      <div className="text-xs text-slate-500">{student.rollNo || 'No Roll No'}</div>
                    </div>
                    
                    <div className="col-span-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {student.section || 'Unassigned'}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500"
                          style={{ width: `${student.percentage}%` }}
                        />
                      </div>
                      <span className="font-bold text-red-600 text-sm">{student.percentage}%</span>
                    </div>

                    <div className="col-span-2 flex justify-end">
                      <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600 transition">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </Protected>
  );
}
