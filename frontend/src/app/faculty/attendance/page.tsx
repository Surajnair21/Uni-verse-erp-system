"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";

type Allocation = {
  id: string;
  sectionId: string;
  subjectId: string;
  section?: { id: string; name?: string; code?: string };
  subject?: { id: string; name?: string; code?: string };
};

type Student = {
  id: string;
  name: string;
  email: string;
  rollNo?: string | null;
};

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

const STATUS_OPTIONS: Status[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusPill(status: Status) {
  switch (status) {
    case "PRESENT":
      return "bg-green-100 text-green-800 border-green-200";
    case "ABSENT":
      return "bg-red-100 text-red-800 border-red-200";
    case "LATE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "EXCUSED":
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
}

export default function FacultyAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [date, setDate] = useState<string>(todayYYYYMMDD());

  const [students, setStudents] = useState<Student[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, Status>>({});

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // 1) Load allocations (faculty scoped)
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await apiFetch<Allocation[]>(`/api/allocations`);
        if (!mounted) return;

        setAllocations(data || []);

        // Auto-select first allocation if none selected
        if ((data || []).length > 0) {
          const first = data[0];
          setSelectedSectionId(first.sectionId);
          setSelectedSubjectId(first.subjectId);
        }
      } catch (e: any) {
        setToast({ type: "error", msg: e.message || "Failed to load allocations" });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Group allocations by section for better UX
  const sections = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>();
    for (const a of allocations) {
      const label =
        a.section?.name ||
        a.section?.code ||
        `Section ${a.sectionId.slice(0, 6)}...`;
      if (!map.has(a.sectionId)) map.set(a.sectionId, { id: a.sectionId, label });
    }
    return Array.from(map.values());
  }, [allocations]);

  const subjectsForSelectedSection = useMemo(() => {
    const list = allocations
      .filter((a) => a.sectionId === selectedSectionId)
      .map((a) => ({
        id: a.subjectId,
        label:
          a.subject?.name ||
          a.subject?.code ||
          `Subject ${a.subjectId.slice(0, 6)}...`,
      }));

    // unique
    const seen = new Set<string>();
    return list.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  }, [allocations, selectedSectionId]);

  // 2) When section changes, ensure subject is valid
  useEffect(() => {
    if (!selectedSectionId) return;
    const valid = subjectsForSelectedSection.some((s) => s.id === selectedSubjectId);
    if (!valid && subjectsForSelectedSection.length > 0) {
      setSelectedSubjectId(subjectsForSelectedSection[0].id);
    }
  }, [selectedSectionId, subjectsForSelectedSection, selectedSubjectId]);

  // 3) Load students for section whenever section changes
  useEffect(() => {
    let mounted = true;
    async function loadStudents() {
      if (!selectedSectionId) return;
      try {
        const data = await apiFetch<Student[]>(
          `/api/attendance/section/${selectedSectionId}/students`
        );
        if (!mounted) return;

        setStudents(data || []);

        // Initialize statuses default PRESENT
        const next: Record<string, Status> = {};
        for (const s of data || []) next[s.id] = "PRESENT";
        setStatusMap(next);
      } catch (e: any) {
        setToast({ type: "error", msg: e.message || "Failed to load students" });
        setStudents([]);
        setStatusMap({});
      }
    }

    loadStudents();
    return () => {
      mounted = false;
    };
  }, [selectedSectionId]);

  function setAll(status: Status) {
    const next: Record<string, Status> = {};
    for (const s of students) next[s.id] = status;
    setStatusMap(next);
  }

  async function onSave() {
    if (!selectedSectionId || !selectedSubjectId) {
      setToast({ type: "error", msg: "Select section and subject first." });
      return;
    }
    if (students.length === 0) {
      setToast({ type: "error", msg: "No students in this section." });
      return;
    }

    try {
      setSaving(true);
      setToast(null);

      const payload = {
        date,
        sectionId: selectedSectionId,
        subjectId: selectedSubjectId,
        records: students.map((s) => ({
          studentId: s.id,
          status: statusMap[s.id] || "PRESENT",
        })),
      };

      await apiFetch<{ message: string }>(`/api/attendance/sessions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setToast({ type: "success", msg: "Attendance saved successfully." });
    } catch (e: any) {
      setToast({ type: "error", msg: e.message || "Failed to save attendance" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell
        role="FACULTY"
        pageTitle="Attendance"
        pageSubtitle="Select your section + subject, mark statuses, and save."
      >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <button
              onClick={onSave}
              disabled={saving || loading}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          {toast && (
            <div
              className={[
                "border rounded-xl px-4 py-3",
                toast.type === "success"
                  ? "bg-green-50 border-green-200 text-green-900"
                  : "bg-red-50 border-red-200 text-red-900",
              ].join(" ")}
            >
              {toast.msg}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Section */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                >
                  {sections.length === 0 && <option value="">No sections</option>}
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                >
                  {subjectsForSelectedSection.length === 0 && (
                    <option value="">No subjects</option>
                  )}
                  {subjectsForSelectedSection.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                />
              </div>

              {/* Quick actions */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Quick set</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setAll("PRESENT")}
                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => setAll("ABSENT")}
                    className="px-3 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    All Absent
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              {loading ? (
                <div className="text-slate-600">Loading…</div>
              ) : students.length === 0 ? (
                <div className="text-slate-600">No students found for this section.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-2 pr-4">Student</th>
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Roll No</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => {
                        const st = statusMap[s.id] || "PRESENT";
                        return (
                          <tr key={s.id} className="border-t border-slate-100">
                            <td className="py-3 pr-4 font-medium text-slate-900">{s.name}</td>
                            <td className="py-3 pr-4 text-slate-700">{s.email}</td>
                            <td className="py-3 pr-4 text-slate-700">{s.rollNo || "-"}</td>
                            <td className="py-3 pr-4">
                              <div className="flex gap-2 flex-wrap">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt}
                                    onClick={() =>
                                      setStatusMap((prev) => ({ ...prev, [s.id]: opt }))
                                    }
                                    className={[
                                      "px-3 py-1.5 rounded-full border text-xs font-semibold",
                                      opt === st
                                        ? statusPill(opt)
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
                                    ].join(" ")}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
