"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { Calendar, Clock, MapPin, CheckCircle, CircleDashed } from "lucide-react";

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function FacultyAttendanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [date, setDate] = useState<string>(todayYYYYMMDD());
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!date) return;
      try {
        setLoading(true);
        const data = await apiFetch<any[]>(`/api/attendance/my-scheduled-classes?date=${date}`);
        if (!mounted) return;
        setClasses(data || []);
      } catch (e: any) {
        setToast({ type: "error", msg: e.message || "Failed to load scheduled classes" });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [date]);

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell
        role="FACULTY"
        pageTitle="Attendance Dashboard"
        pageSubtitle="View your scheduled classes for the day and mark attendance."
      >
        <div className="space-y-6">
          {toast && (
            <div className={`border rounded-xl px-4 py-3 ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
              {toast.msg}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-5 h-5 text-sky-500" />
              <span className="font-medium text-sm">Select Date:</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-slate-200 bg-slate-50 text-slate-900 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 p-2.5 flex-1 max-w-sm"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Classes Scheduled for {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-slate-400 animate-pulse">
                Loading schedule...
              </div>
            ) : classes.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 mb-3 text-slate-300" />
                <p>No classes scheduled for you on this day.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => {
                  const isMarked = cls.attendanceStatus === "MARKED";

                  return (
                    <div key={cls.id} className="relative rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow flex flex-col h-full group">
                      <div className="absolute top-4 right-4">
                        {isMarked ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                            <CheckCircle className="w-3.5 h-3.5" /> MARKED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                            <CircleDashed className="w-3.5 h-3.5 animate-spin-slow" /> PENDING
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-1 w-3/4">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {cls.startTime.substring(0, 5)} - {cls.endTime.substring(0, 5)}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-slate-900 mt-2 mb-1 truncate" title={cls.subject.name}>{cls.subject.name}</h4>
                      <div className="text-xs font-medium text-slate-500 mb-4">Section {cls.section.name} (Batch {cls.section.batchYear})</div>

                      {cls.room && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-auto mb-4">
                          <MapPin className="w-3.5 h-3.5" /> Room: {cls.room}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <Link
                          href={`/faculty/attendance/mark/${cls.id}?date=${date}&sectionId=${cls.sectionId}&subjectId=${cls.subjectId}`}
                          className={`flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${isMarked
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                            }`}
                        >
                          {isMarked ? "Edit Attendance" : "Mark Attendance"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
