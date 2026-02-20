"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function FacultyAllocationsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const al = await apiFetch<any[]>("/api/allocations");
    const my = user?.id ? al.filter((x) => x.faculty?.id === user.id) : [];
    setRows(my);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell
        role="FACULTY"
        pageTitle="My Classes"
        pageSubtitle="This is your teaching map (Phase 1)."
      >
        <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
          <div className="text-sm font-semibold text-slate-900">My Allocations</div>
          <div className="text-xs text-slate-600 mt-1">Total: {rows.length}</div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-600">
                <tr className="border-b border-slate-200">
                  <th className="py-2 text-left">Subject</th>
                  <th className="py-2 text-left">Section</th>
                  <th className="py-2 text-left">Course/Sem</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <div className="font-medium text-slate-900">{a.subject?.name}</div>
                      <div className="text-xs text-slate-500">{a.subject?.code}</div>
                    </td>
                    <td className="py-3 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {a.section?.department?.code} • Section {a.section?.name}-{a.section?.batchYear}
                      </div>
                    </td>
                    <td className="py-3 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {a.section?.semester?.course?.code} • Sem {a.section?.semester?.number}
                      </div>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      No allocations found for your account.
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
