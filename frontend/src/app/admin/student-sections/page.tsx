"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { RefreshCw, Link2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Dept = { id: string; name: string; code: string };

type Section = {
  id: string;
  name: string;
  batchYear: number;
  department: Dept;
  semester: { id: string; number: number; course: { id: string; name: string; code: string } };
};

type StudentProfile = {
  rollNo?: string | null;
  batchYear?: number | null;
  section?: {
    id: string;
    name: string;
    batchYear: number;
    department?: Dept | null;
    semester?: { number: number; course?: { name: string; code: string } | null } | null;
  } | null;
};

type StudentUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | string;
  studentProfile?: StudentProfile | null;
};

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function AdminStudentSectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<StudentUser[]>([]);

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sectionId, setSectionId] = useState("");

  async function loadAll() {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const [stu, sec] = await Promise.all([
        apiFetch<StudentUser[]>("/api/users?role=STUDENT"),
        apiFetch<Section[]>("/api/master/sections"),
      ]);

      // Note: /api/users?role=STUDENT does NOT include section info in this codebase.
      // Preserve any locally-known section mapping from previous assigns in this session.
      setStudents((prev) => {
        const prevSectionByUserId = new Map<string, StudentProfile["section"]>();
        for (const p of prev) {
          const sec = p.studentProfile?.section;
          if (sec) prevSectionByUserId.set(p.id, sec);
        }

        return stu.map((u) => {
          const preserved = prevSectionByUserId.get(u.id);
          if (!preserved) return u;
          return {
            ...u,
            studentProfile: {
              ...(u.studentProfile ?? {}),
              section: preserved,
            },
          };
        });
      });
      setSections(sec);
    } catch (e: any) {
      setErr(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  const sectionOptions = useMemo(
    () =>
      sections.map((s) => ({
        value: s.id,
        label: `${s.department.code} • ${s.semester.course.code} • Sem ${s.semester.number} • ${s.name}-${s.batchYear}`,
      })),
    [sections]
  );

  const studentOptions = useMemo(
    () =>
      students.map((u) => ({
        value: u.id,
        label: `${u.name} • ${u.email} ${
          u.studentProfile?.rollNo ? `• ${u.studentProfile.rollNo}` : ""
        }`,
      })),
    [students]
  );

  const filteredStudents = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((u) => {
      const roll = u.studentProfile?.rollNo?.toLowerCase() || "";
      const batch = u.studentProfile?.batchYear
        ? String(u.studentProfile.batchYear)
        : "";
      const sectionDept = u.studentProfile?.section?.department?.code?.toLowerCase() || "";
      const sectionCourse = u.studentProfile?.section?.semester?.course?.code?.toLowerCase() || "";
      return (
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        roll.includes(needle) ||
        batch.includes(needle) ||
        sectionDept.includes(needle) ||
        sectionCourse.includes(needle)
      );
    });
  }, [students, q]);

  async function assignSection() {
    if (!studentId || !sectionId) return;
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const updated = await apiFetch<{ userId: string; sectionId: string }>(
        `/api/students/${studentId}/assign-section`,
        {
          method: "PUT",
          body: JSON.stringify({ sectionId }),
        }
      );
      const pickedSection = sections.find((s) => s.id === updated.sectionId);

      setStudents((prev) =>
        prev.map((u) => {
          if (u.id !== updated.userId) return u;
          return {
            ...u,
            studentProfile: {
              ...(u.studentProfile ?? {}),
              section: pickedSection
                ? {
                    id: pickedSection.id,
                    name: pickedSection.name,
                    batchYear: pickedSection.batchYear,
                    department: pickedSection.department,
                    semester: {
                      number: pickedSection.semester.number,
                      course: pickedSection.semester.course,
                    },
                  }
                : u.studentProfile?.section ?? null,
            },
          };
        })
      );

      setOk(
        pickedSection
          ? `Assigned successfully: ${pickedSection.department.code} • ${pickedSection.semester.course.code} • Sem ${pickedSection.semester.number} • ${pickedSection.name}-${pickedSection.batchYear}`
          : "Assigned successfully."
      );

      setStudentId("");
      setSectionId("");
    } catch (e: any) {
      setErr(e?.message || "Failed to assign section");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Protected allow={["ADMIN"]}>
      <AdminShell
        title="Student Sections"
        subtitle="Map students to academic sections. (Required before student dashboard shows section/subjects.)"
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="text-sm text-slate-700">
                Assign a section to each student.
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search student / roll / section..."
                  className="w-full sm:w-72 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <button
              onClick={loadAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_1fr]">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Assign Section
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Link a student to a specific department / course / semester / section.
                    </div>
                  </div>
                  <Link2 className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-600">Student</label>
                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Select student</option>
                      {studentOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Section</label>
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Select section</option>
                      {sectionOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {err && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {err}
                    </div>
                  )}

                  {ok && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      {ok}
                    </div>
                  )}

                  <button
                    onClick={assignSection}
                    disabled={busy || !studentId || !sectionId}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600 transition disabled:opacity-60"
                  >
                    {busy ? "Assigning..." : "Assign Section"}
                  </button>
                </div>
              </TiltCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Student → Section Mapping
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Showing {filteredStudents.length} of {students.length} students.
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-left">Student</th>
                        <th className="py-2 text-left">Roll / Batch</th>
                        <th className="py-2 text-left">Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((u) => {
                        const sp = u.studentProfile;
                        const sec = sp?.section;
                        return (
                          <tr key={u.id} className="border-b border-slate-100">
                            <td className="py-3">
                              <div className="font-medium text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </td>
                            <td className="py-3 text-slate-700">
                              <div className="text-xs">
                                {sp?.rollNo || "—"} • {sp?.batchYear || "—"}
                              </div>
                            </td>
                            <td className="py-3 text-slate-700">
                              {sec ? (
                                <>
                                  <div className="font-medium text-slate-900">
                                    {sec.department?.code} • {sec.semester?.course?.code} • Sem{" "}
                                    {sec.semester?.number}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Section {sec.name}-{sec.batchYear}
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-slate-500">
                                  Not linked. Use the form to assign.
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {!loading && filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </AdminShell>
    </Protected>
  );
}

