"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import StatsGrid from "@/components/admin/StatsGrid";
import SetupChecklist from "@/components/admin/SetupChecklist";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

export default function AdminHome() {
  const [stats, setStats] = useState({
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

    setStats({
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
    <Protected allow={["ADMIN"]}>
      <AdminShell title="Admin Dashboard" subtitle="Setup master data, users, and allocations.">
        <div className="space-y-5">
          <StatsGrid
            stats={{
              departments: stats.departments,
              programs: stats.programs,
              courses: stats.courses,
              subjects: stats.subjects,
              sections: stats.sections,
            }}
          />
          <SetupChecklist stats={stats} />
        </div>
      </AdminShell>
    </Protected>
  );
}
