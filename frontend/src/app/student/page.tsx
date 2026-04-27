"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { NoticeBoard } from "@/components/dashboard/NoticeBoard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ClipboardList, CalendarDays, BarChart2, AlertTriangle, ChevronRight, GraduationCap } from "lucide-react";

type AttendanceStat = { subject: string; totalSessions: number; presentCount: number; percentage: string };
type IaMark = { subject: { name: string; code: string }; components: { name: string; type: string; maxMarks: number; marksObtained: number; percentage: string }[] };

function AttendanceDonut({ pct }: { pct: number }) {
  const r = 28, circ = 2 * Math.PI * r, fill = circ * (pct / 100);
  const color = pct >= 75 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <svg width="70" height="70" viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
      <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 35 35)" style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="35" y="35" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 11, fontWeight: 700, fill: color }}>{pct}%</text>
    </svg>
  );
}

export default function StudentHome() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceStat[]>([]);
  const [iaMarks, setIaMarks] = useState<IaMark[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [prof, att, ia, tt] = await Promise.all([
          apiFetch<any>("/api/students/me").catch(() => null),
          apiFetch<AttendanceStat[]>("/api/attendance/me/summary").catch(() => []),
          apiFetch<IaMark[]>("/api/ia/my-marks").catch(() => []),
          apiFetch<any[]>("/api/timetable").catch(() => []),
        ]);
        setProfile(prof); setAttendance(Array.isArray(att) ? att : []);
        setIaMarks(Array.isArray(ia) ? ia : []); setTimetable(Array.isArray(tt) ? tt : []);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const section = profile?.studentProfile?.section;
  const lowAttendance = attendance.filter(a => parseFloat(a.percentage) < 75);
  const overallAttPct = attendance.length ? Math.round(attendance.reduce((s, a) => s + parseFloat(a.percentage), 0) / attendance.length) : null;
  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayDay = dayNames[new Date().getDay()];
  const todaySlots = timetable.filter((s: any) => s.dayOfWeek === todayDay).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  const greeting = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell role="STUDENT" pageTitle="Overview" pageSubtitle={today}>
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px" }} />
            <div className="relative">
              <div className="text-xl font-bold">Good {greeting}, {user?.name?.split(" ")[0]} 👋</div>
              {section ? (
                <div className="text-sm text-violet-100 mt-1.5">{section.department?.name} · {section.semester?.course?.code} · Sem {section.semester?.number} · Section {section.name}</div>
              ) : (
                <div className="text-sm text-violet-200 mt-1.5">You are not linked to a section yet — contact Admin.</div>
              )}
              {overallAttPct !== null && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-semibold">
                  Overall Attendance: {overallAttPct}%
                  {overallAttPct < 75 && <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />}
                </div>
              )}
            </div>
          </motion.div>

          <NoticeBoard />

          {!loading && lowAttendance.length > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2"><AlertTriangle className="w-4 h-4" /> Attendance Shortage in {lowAttendance.length} subject{lowAttendance.length > 1 ? "s" : ""}</div>
              <div className="space-y-1">
                {lowAttendance.map(a => (
                  <div key={a.subject} className="flex items-center justify-between text-xs text-red-700 bg-red-100/80 rounded-lg px-3 py-1.5">
                    <span className="font-medium">{a.subject}</span>
                    <span className="font-bold">{a.percentage}% · {a.presentCount}/{a.totalSessions}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100"><ClipboardList className="w-3.5 h-3.5 text-violet-600" /></div>Attendance
                </div>
                <Link href="/student/attendance" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
              ) : attendance.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">No attendance data yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {attendance.map((a, i) => {
                    const pct = parseFloat(a.percentage);
                    return (
                      <motion.div key={a.subject} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-4 px-5 py-3">
                        <AttendanceDonut pct={Math.round(pct)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-800 truncate">{a.subject}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{a.presentCount}/{a.totalSessions} attended</div>
                          {pct < 75 && <div className="text-xs text-red-600 font-semibold mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Below 75%</div>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100"><BarChart2 className="w-3.5 h-3.5 text-teal-600" /></div>IA Marks
                </div>
                <Link href="/student/ia" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">Details <ChevronRight className="w-3 h-3" /></Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-3">{[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}</div>
              ) : iaMarks.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm">No marks published yet.</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {iaMarks.map((sub, i) => {
                    const totalObtained = sub.components.reduce((s, c) => s + c.marksObtained, 0);
                    const totalMax = sub.components.reduce((s, c) => s + c.maxMarks, 0);
                    const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
                    return (
                      <motion.div key={sub.subject.code} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="px-5 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="text-sm font-semibold text-slate-800 truncate max-w-[70%]">{sub.subject.name}</div>
                          <div className="text-xs font-bold text-slate-700">{totalObtained}/{totalMax} <span className="text-slate-400 font-normal">({pct}%)</span></div>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 60 ? "#10b981" : "#f59e0b" }} />
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {sub.components.map(c => (
                            <span key={c.name} className="text-[10px] bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">{c.name}: {c.marksObtained}/{c.maxMarks}</span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100"><CalendarDays className="w-3.5 h-3.5 text-sky-600" /></div>
                Today's Classes <span className="text-xs text-slate-500 font-normal ml-1">({todayDay.charAt(0) + todayDay.slice(1).toLowerCase()})</span>
              </div>
              <Link href="/student/timetable" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">Full Timetable <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">{[1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />)}</div>
            ) : todaySlots.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">No classes scheduled today.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {todaySlots.map((slot: any, i: number) => (
                  <motion.div key={slot.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 px-5 py-3">
                    <div className="text-xs font-mono font-semibold text-slate-500 w-28 flex-shrink-0">{slot.startTime?.substring(0, 5)} – {slot.endTime?.substring(0, 5)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{slot.subject?.name}</div>
                      <div className="text-xs text-slate-500">{slot.faculty?.name && `By ${slot.faculty.name}`}{slot.room && ` · Room ${slot.room}`}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { href: "/student/attendance", label: "Attendance", icon: ClipboardList, gradient: "from-violet-500 to-violet-600" },
              { href: "/student/timetable", label: "Timetable", icon: CalendarDays, gradient: "from-sky-500 to-sky-600" },
              { href: "/student/ia", label: "IA Marks", icon: BarChart2, gradient: "from-teal-500 to-teal-600" },
              { href: "/student/profile", label: "My Profile", icon: GraduationCap, gradient: "from-amber-500 to-amber-600" },
            ].map((item, i) => (
              <motion.div key={item.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={item.href} className="flex flex-col items-center gap-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-shadow text-center group">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm`}><item.icon className="w-5 h-5" /></div>
                  <div className="text-xs font-semibold text-slate-700">{item.label}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
