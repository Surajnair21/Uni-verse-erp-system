"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";

export default function HodAllocationsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const al = await apiFetch<any[]>("/api/allocations");
    const deptId = user?.departmentId;
    const filtered = deptId ? al.filter((x) => x.section?.department?.id === deptId) : [];
    setRows(filtered);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(() => {
    if (!user?.departmentId) return "Allocations (No department assigned)";
    return "Allocations (Your Department)";
  }, [user?.departmentId]);

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell role="HOD" pageTitle={title} pageSubtitle="Read-only view for HOD (Phase 1)">
        <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
          <div className="text-sm font-semibold text-slate-900">Teaching Allocations</div>
          <div className="text-xs text-slate-600 mt-1">Total: {rows.length}</div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-left">Faculty</th>
                  <th className="py-2 text-left">Subject</th>
                  <th className="py-2 text-left">Section</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{a.faculty?.name}</div>
                      <div className="text-xs text-slate-500">{a.faculty?.email}</div>
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{a.subject?.name}</div>
                      <div className="text-xs text-slate-500">{a.subject?.code}</div>
                    </td>
                    <td className="py-3 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {a.section?.department?.code} • {a.section?.semester?.course?.code} • Sem {a.section?.semester?.number}
                      </div>
                      <div className="text-xs text-slate-500">
                        Section {a.section?.name}-{a.section?.batchYear}
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      No allocations found for your department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TiltCard>
      </DashboardShell>
    </Protected>
  );
}
