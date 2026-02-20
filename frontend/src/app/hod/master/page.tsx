"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function HodMasterViewPage() {
  const [data, setData] = useState({
    departments: 0,
    programs: 0,
    courses: 0,
    subjects: 0,
    semesters: 0,
    sections: 0,
  });

  async function load() {
    const [d, p, c, s, sem, sec] = await Promise.all([
      apiFetch<any[]>("/api/master/departments"),
      apiFetch<any[]>("/api/master/programs"),
      apiFetch<any[]>("/api/master/courses"),
      apiFetch<any[]>("/api/master/subjects"),
      apiFetch<any[]>("/api/master/semesters"),
      apiFetch<any[]>("/api/master/sections"),
    ]);

    setData({
      departments: d.length,
      programs: p.length,
      courses: c.length,
      subjects: s.length,
      semesters: sem.length,
      sections: sec.length,
    });
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell role="HOD" pageTitle="Master Data (View)" pageSubtitle="Counts only (Phase 1)">
        <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
          <div className="text-sm font-semibold text-slate-900">Structure Snapshot</div>
          <div className="text-xs text-slate-600 mt-1">Read-only quick counts</div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.entries(data).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600 capitalize">{k}</div>
                <div className="text-2xl font-semibold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
        </TiltCard>
      </DashboardShell>
    </Protected>
  );
}
