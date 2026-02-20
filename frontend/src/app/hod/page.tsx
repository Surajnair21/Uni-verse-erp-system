"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import StatsGrid from "@/components/admin/StatsGrid";
import SetupChecklist from "@/components/admin/SetupChecklist";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";

export default function HodHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    departments: 0,
    programs: 0,
    courses: 0,
    subjects: 0,
    semesters: 0,
    sections: 0,
  });

  const [allocCount, setAllocCount] = useState(0);

  async function load() {
    const [d, p, c, s, sem, sec, al] = await Promise.all([
      apiFetch<any[]>("/api/master/departments"),
      apiFetch<any[]>("/api/master/programs"),
      apiFetch<any[]>("/api/master/courses"),
      apiFetch<any[]>("/api/master/subjects"),
      apiFetch<any[]>("/api/master/semesters"),
      apiFetch<any[]>("/api/master/sections"),
      apiFetch<any[]>("/api/allocations"),
    ]);

    setStats({
      departments: d.length,
      programs: p.length,
      courses: c.length,
      subjects: s.length,
      semesters: sem.length,
      sections: sec.length,
    });

    // client-side dept filter for now
    const deptId = user?.departmentId;
    const filtered = deptId
      ? al.filter((x: any) => x.section?.department?.id === deptId)
      : [];
    setAllocCount(filtered.length);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deptLabel = useMemo(() => {
    if (!user?.departmentId) return "Not assigned";
    return `Dept scoped (ID: ${user.departmentId})`;
  }, [user?.departmentId]);

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell
        role="HOD"
        pageTitle="HOD Dashboard"
        pageSubtitle={`Overview • ${deptLabel} • Allocations in your dept: ${allocCount}`}
      >
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
      </DashboardShell>
    </Protected>
  );
}
