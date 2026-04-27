"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import StatsGrid from "@/components/admin/StatsGrid";
import { NoticeBoard } from "@/components/dashboard/NoticeBoard";
import { PublishNoticeModal } from "@/components/admin/PublishNoticeModal";
import SetupChecklist from "@/components/admin/SetupChecklist";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, PenLine } from "lucide-react";

type Stats = {
  departments: number; programs: number; courses: number;
  subjects: number; semesters: number; sections: number;
  users: number; timetableSlots: number;
};

const DEFAULT_STATS: Stats = {
  departments: 0, programs: 0, courses: 0, subjects: 0,
  semesters: 0, sections: 0, users: 0, timetableSlots: 0,
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try {
      const [d, p, c, s, sem, sec, users, tslots] = await Promise.all([
        apiFetch<any[]>("/api/master/departments").catch(() => []),
        apiFetch<any[]>("/api/master/programs").catch(() => []),
        apiFetch<any[]>("/api/master/courses").catch(() => []),
        apiFetch<any[]>("/api/master/subjects").catch(() => []),
        apiFetch<any[]>("/api/master/semesters").catch(() => []),
        apiFetch<any[]>("/api/master/sections").catch(() => []),
        apiFetch<any[]>("/api/users").catch(() => []),
        apiFetch<any[]>("/api/timetable").catch(() => []),
      ]);
      setStats({
        departments: Array.isArray(d) ? d.length : 0, programs: Array.isArray(p) ? p.length : 0,
        courses: Array.isArray(c) ? c.length : 0, subjects: Array.isArray(s) ? s.length : 0,
        semesters: Array.isArray(sem) ? sem.length : 0, sections: Array.isArray(sec) ? sec.length : 0,
        users: Array.isArray(users) ? users.length : 0, timetableSlots: Array.isArray(tslots) ? tslots.length : 0,
      });
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard stats.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <Protected allow={["ADMIN"]}>
      <AdminShell title="Admin Dashboard" subtitle="Setup master data, users, and allocations.">
        <div className="space-y-5">
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
              <div className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</div>
              <button onClick={load} className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 transition"><RefreshCw className="w-3.5 h-3.5" />Retry</button>
            </div>
          )}

          <div className="relative">
            <NoticeBoard />
            <div className="absolute top-5 right-5">
              <button onClick={() => setShowNoticeModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition border border-indigo-100">
                <PenLine className="w-3.5 h-3.5" /> Publish
              </button>
            </div>
          </div>

          <StatsGrid stats={stats} loading={loading} />
          <SetupChecklist stats={stats} />

          {showNoticeModal && (
            <PublishNoticeModal onClose={() => setShowNoticeModal(false)} onSuccess={() => { alert("Notice published!"); window.location.reload(); }} />
          )}
        </div>
      </AdminShell>
    </Protected>
  );
}
