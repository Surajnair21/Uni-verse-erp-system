"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";

type SummaryRow = {
  subject: string;
  totalSessions: number;
  presentCount: number;
  percentage: string; 
};

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<SummaryRow[]>(
          "/api/attendance/me/summary"
        );
        if (!mounted) return;
        setRows(data || []);
      } catch (e: any) {
        setError(e.message || "Failed to load attendance");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Attendance</h1>
        <p className="text-slate-600 mt-1">Subject-wise attendance summary.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        {loading ? (
          <div className="text-slate-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-slate-600">No attendance records yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map((r) => {
              const pct = Number(r.percentage || 0);
              return (
                <div
                  key={r.subject}
                  className="border border-slate-200 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{r.subject}</h3>
                    <span className="text-sm font-semibold text-slate-700">
                      {pct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-orange-600"
                      style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                    />
                  </div>

                  <div className="mt-3 text-sm text-slate-700 flex justify-between">
                    <span>Present: {r.presentCount}</span>
                    <span>Total: {r.totalSessions}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
