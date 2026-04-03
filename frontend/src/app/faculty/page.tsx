"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CalendarDays, ClipboardCheck, BookMarked, Clock,
  CheckCircle2, CircleDashed, ChevronRight, Users,
} from "lucide-react";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 shadow-sm ${color}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="text-3xl font-bold text-slate-900 mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function FacultyHome() {
  const { user } = useAuth();
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [iaComponents, setIaComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [classes, allocs, ia] = await Promise.all([
          apiFetch<any[]>(`/api/attendance/my-scheduled-classes?date=${todayStr()}`).catch(() => []),
          apiFetch<any[]>("/api/allocations").catch(() => []),   // already scoped to this faculty by backend
          apiFetch<any[]>("/api/ia").catch(() => []),
        ]);
        setTodayClasses(Array.isArray(classes) ? classes : []);
        setAllocations(Array.isArray(allocs) ? allocs : []);
        setIaComponents(Array.isArray(ia) ? ia : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueSections = new Set(allocations.map((a: any) => a.sectionId)).size;
  const uniqueSubjects = new Set(allocations.map((a: any) => a.subjectId)).size;
  const markedToday = todayClasses.filter((c: any) => c.attendanceStatus === "MARKED").length;
  const pendingToday = todayClasses.filter((c: any) => c.attendanceStatus === "PENDING").length;
  const totalMarks = iaComponents.reduce((sum: number, c: any) => sum + (c.marks?.length ?? 0), 0);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell role="FACULTY" pageTitle="Overview" pageSubtitle={today}>
        <div className="space-y-6">
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white shadow-lg">
            <div className="text-xl font-bold">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0]} 👋</div>
            <div className="text-sm text-sky-100 mt-1">
              You have <span className="font-semibold text-white">{todayClasses.length}</span> classes scheduled today
              {pendingToday > 0 && <span className="ml-1">· <span className="font-semibold text-amber-200">{pendingToday} pending</span></span>}
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
              ))
            ) : (
              <>
                <StatCard label="Sections" value={uniqueSections} sub="assigned to you" color="bg-sky-50 border-sky-200" />
                <StatCard label="Subjects" value={uniqueSubjects} sub="across all sections" color="bg-violet-50 border-violet-200" />
                <StatCard label="Today's Classes" value={todayClasses.length} sub={`${markedToday} marked · ${pendingToday} pending`} color="bg-amber-50 border-amber-200" />
                <StatCard label="IA Marks Entered" value={totalMarks} sub={`${iaComponents.length} components`} color="bg-emerald-50 border-emerald-200" />
              </>
            )}
          </div>

          {/* Today's schedule */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <CalendarDays className="w-4 h-4 text-sky-500" />
                Today's Schedule
              </div>
              <Link href="/faculty/attendance" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : todayClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarDays className="w-8 h-8 mb-2 text-slate-200" />
                <p className="text-sm">No classes scheduled today</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayClasses.map((cls: any, i: number) => {
                  const marked = cls.attendanceStatus === "MARKED";
                  return (
                    <motion.div key={cls.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${marked ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{cls.subject?.name}</div>
                          <div className="text-xs text-slate-500">
                            Section {cls.section?.name} · {cls.startTime?.substring(0, 5)}–{cls.endTime?.substring(0, 5)}
                            {cls.room && ` · Room ${cls.room}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {marked ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Marked
                          </span>
                        ) : (
                          <Link href={`/faculty/attendance/mark/${cls.id}?date=${todayStr()}&sectionId=${cls.sectionId}&subjectId=${cls.subjectId}`}
                            className="text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-full px-3 py-1 hover:bg-sky-100 transition flex items-center gap-1">
                            <CircleDashed className="w-3 h-3" /> Mark Now
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/faculty/attendance", label: "Attendance", desc: "Mark for today's classes", icon: ClipboardCheck, color: "bg-sky-500" },
              { href: "/faculty/timetable", label: "Timetable", desc: "View your weekly schedule", icon: Clock, color: "bg-violet-500" },
              { href: "/faculty/ia", label: "IA Marks", desc: "Enter assessment marks", icon: BookMarked, color: "bg-teal-500" },
            ].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link href={item.href}
                  className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:shadow-md transition group">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white flex-shrink-0`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                    <div className="text-xs text-slate-500 truncate">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
