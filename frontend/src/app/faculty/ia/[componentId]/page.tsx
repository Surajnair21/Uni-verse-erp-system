"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { Loader2, ChevronLeft, Save } from "lucide-react";

type Student = { id: string; name: string; email: string; rollNo?: string | null };

export default function FacultyIAEnterMarksPage({ params }: { params: Promise<{ componentId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = React.use(params);
  const { componentId } = resolvedParams;
  const sectionId = searchParams.get("sectionId");

  const [component, setComponent] = useState<any>(null);
  const [students, setStudents]   = useState<Student[]>([]);
  const [marksMap, setMarksMap]   = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // ✅ Fetch the single component directly via GET /api/ia/:id
        const comp = await apiFetch<any>(`/api/ia/${componentId}`);
        setComponent(comp ?? null);

        const sid = comp?.section?.id || sectionId;
        if (sid) {
          const studs = await apiFetch<Student[]>(`/api/attendance/section/${sid}/students`);
          setStudents(studs || []);

          // Pre-fill existing marks
          const initial: Record<string, string> = {};
          for (const s of studs || []) {
            const existing = comp?.marks?.find((m: any) => m.studentId === s.id);
            initial[s.id] = existing ? String(existing.marksObtained) : "";
          }
          setMarksMap(initial);
        }
      } catch (e: any) {
        setToast({ ok: false, msg: e.message || "Failed to load component." });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [componentId, sectionId]);

  async function onSave() {
    if (!component) return;
    setSaving(true);
    setToast(null);
    try {
      const marks = Object.entries(marksMap)
        .filter(([, v]) => v !== "")
        .map(([studentId, v]) => ({ studentId, marksObtained: parseFloat(v) }));

      if (marks.length === 0) {
        setToast({ ok: false, msg: "Enter at least one mark before saving." });
        return;
      }

      await apiFetch(`/api/ia/${componentId}/marks`, {
        method: "PUT",
        body: JSON.stringify({ marks }),
      });
      setToast({ ok: true, msg: "Marks saved successfully!" });
    } catch (e: any) {
      setToast({ ok: false, msg: e.message || "Failed to save marks." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected allow={["FACULTY", "ADMIN"]}>
      <DashboardShell role="FACULTY" pageTitle="Enter Marks" pageSubtitle={component ? `${component.name} · Max ${component.maxMarks} marks` : "Loading..."}>
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button onClick={() => router.push("/faculty/ia")}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" /> Back to Components
            </button>
            <button onClick={onSave} disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save All Marks"}
            </button>
          </div>

          {toast && (
            <div className={`rounded-xl px-4 py-3 border text-sm font-medium ${toast.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {toast.msg}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-400 animate-pulse">Loading roster...</div>
            ) : students.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No students found in this section.</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-5 text-left">Student</th>
                    <th className="py-3 px-5 text-left hidden sm:table-cell">Roll No</th>
                    <th className="py-3 px-5 text-center w-48">
                      Marks Obtained (/{component?.maxMarks ?? "?"})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5 font-medium text-slate-900">{s.name}</td>
                      <td className="py-3 px-5 text-slate-500 hidden sm:table-cell">{s.rollNo || "—"}</td>
                      <td className="py-3 px-5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={component?.maxMarks}
                          step={0.5}
                          placeholder="—"
                          value={marksMap[s.id] ?? ""}
                          onChange={e => setMarksMap(prev => ({ ...prev, [s.id]: e.target.value }))}
                          className="w-28 border border-slate-200 rounded-xl px-3 py-1.5 text-center text-sm bg-white focus:ring-2 focus:ring-sky-300 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
