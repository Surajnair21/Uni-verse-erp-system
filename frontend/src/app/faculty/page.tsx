"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";

export default function FacultyHome() {
  const { user } = useAuth();
  const [mine, setMine] = useState<any[]>([]);

  async function load() {
    const al = await apiFetch<any[]>("/api/allocations");
    const my = user?.id ? al.filter((x) => x.faculty?.id === user.id) : [];
    setMine(my);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const sections = new Set(mine.map((x) => x.section?.id)).size;
    const subjects = new Set(mine.map((x) => x.subject?.id)).size;
    return { sections, subjects, allocations: mine.length };
  }, [mine]);

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell
        role="FACULTY"
        pageTitle="Faculty Dashboard"
        pageSubtitle={`My allocations: ${summary.allocations} • Subjects: ${summary.subjects} • Sections: ${summary.sections}`}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
            <div className="text-sm font-semibold text-slate-900">Today’s Focus</div>
            <div className="text-xs text-slate-600 mt-1">
              Attendance & IA Marks module will use your allocations.
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Allocations</div>
                <div className="text-2xl font-semibold text-slate-900">{summary.allocations}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Subjects</div>
                <div className="text-2xl font-semibold text-slate-900">{summary.subjects}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Sections</div>
                <div className="text-2xl font-semibold text-slate-900">{summary.sections}</div>
              </div>
            </div>
          </TiltCard>

          <TiltCard className="rounded-2xl bg-linear-to-br from-orange-50 to-sky-50 border border-slate-200 shadow-md p-4">
            <div className="text-sm font-semibold text-slate-900">What’s Next</div>
            <ul className="mt-3 text-sm text-slate-700 space-y-2">
              <li>• Mark attendance for each allocated section</li>
              <li>• Enter IA marks (quiz/assignment/midterm)</li>
              <li>• Auto reports for HOD + Admin</li>
            </ul>
          </TiltCard>
        </div>
      </DashboardShell>
    </Protected>
  );
}
