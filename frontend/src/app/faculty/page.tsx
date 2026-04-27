"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { NoticeBoard } from "@/components/dashboard/NoticeBoard";
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

function StatCard({ label, value, sub, icon: Icon, gradient }: { label: string; value: string | number; sub?: string; icon: any; gradient: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm mb-3`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
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
          apiFetch<any[]>("/api/allocations").catch(() => []),
          apiFetch<any[]>("/api/ia").catch(() => []),
        ]);
        setTodayClasses(Array.isArray(classes) ? classes : []);
        setAllocations(Array.isArray(allocs) ? allocs : []);
        setIaComponents(Array.isArray(ia) ? ia : []);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const uniqueSections = new Set(allocations.map((a: any) => a.sectionId)).size;
  const uniqueSubjects = new Set(allocations.map((a: any) => a.subjectId)).size;
  const markedToday = todayClasses.filter((c: any) => c.attendanceStatus === "MARKED").length;
  const pendingToday = todayClasses.filter((c: any) => c.attendanceStatus === "PENDING").length;
  const totalMarks = iaComponents.reduce((sum: number, c: any) => sum + (c.marks?.length ?? 0), 0);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const greeting = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening";

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell role="FACULTY" pageTitle="Overview" pageSubtitle={today}>
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
            <div className="relative">
              <div className="text-xl font-bold">Good {greeting}, {user?.name?.split(" ")[0]} 👋</div>
              <div className="text-sm text-indigo-100 mt-1.5">
                You have <span className="font-semibold text-white">{todayClasses.length}</span> classes today
                {pendingToday > 0 && <span className="ml-1">· <span className="font-semibold text-amber-200">{pendingToday} pending</span></span>}
              </div>
            </div>
          </motion.div>

          <NoticeBoard />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />) : (
              <>
                <StatCard label="Sections" value={uniqueSections} sub="assigned" icon={Users} gradient="from-indigo-500 to-indigo-600" />
                <StatCard label="Subjects" value={uniqueSubjects} sub="teaching" icon={BookMarked} gradient="from-violet-500 to-violet-600" />
                <StatCard label="Classes" value={todayClasses.length} sub={`${markedToday} done · ${pendingToday} pending`} icon={CalendarDays} gradient="from-amber-500 to-amber-600" />
                <StatCard label="IA Marks" value={totalMarks} sub={`${iaComponents.length} components`} icon={ClipboardCheck} gradient="from-emerald-500 to-emerald-600" />
              </>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100"><CalendarDays className="w-3.5 h-3.5 text-sky-600" /></div>
                Today's Schedule
              </div>
              <Link href="/faculty/attendance" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2].map(i => <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />)}</div>
            ) : todayClasses.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-slate-400"><CalendarDays className="w-10 h-10 text-slate-200 mb-3" /><p className="text-sm">No classes today</p></div>
            ) : (
              <div className="divide-y divide-slate-50">
                {todayClasses.map((cls: any, i: number) => {
                  const marked = cls.attendanceStatus === "MARKED";
                  return (
                    <motion.div key={cls.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${marked ? "bg-emerald-400" : "bg-amber-400"}`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{cls.subject?.name}</div>
                          <div className="text-xs text-slate-500">Sec {cls.section?.name} · {cls.startTime?.substring(0, 5)}–{cls.endTime?.substring(0, 5)}{cls.room && ` · ${cls.room}`}</div>
                        </div>
                      </div>
                      {marked ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1"><CheckCircle2 className="w-3 h-3" /> Marked</span>
                      ) : (
                        <Link href={`/faculty/attendance/mark/${cls.id}?date=${todayStr()}&sectionId=${cls.sectionId}&subjectId=${cls.subjectId}`}
                          className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 hover:bg-indigo-100 transition flex items-center gap-1"><CircleDashed className="w-3 h-3" /> Mark</Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/faculty/attendance", label: "Attendance", desc: "Mark for today", icon: ClipboardCheck, gradient: "from-indigo-500 to-indigo-600" },
              { href: "/faculty/timetable", label: "Timetable", desc: "Weekly schedule", icon: Clock, gradient: "from-violet-500 to-violet-600" },
              { href: "/faculty/ia", label: "IA Marks", desc: "Enter marks", icon: BookMarked, gradient: "from-emerald-500 to-emerald-600" },
            ].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link href={item.href} className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-shadow group">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}><item.icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-slate-900">{item.label}</div><div className="text-xs text-slate-500">{item.desc}</div></div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
