"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Dept = { id: string; name: string; code: string };
type Subject = { id: string; name: string; code: string; credits: number; departmentId: string };
type Section = {
  id: string;
  name: string;
  batchYear: number;
  department: Dept;
  semester: { id: string; number: number; course: { id: string; name: string; code: string } };
};
type User = { id: string; name: string; email: string; role: "FACULTY" | string; departmentId?: string | null };

type AllocationRow = {
  id: string;
  createdAt: string;
  faculty: { id: string; name: string; email: string };
  subject: { id: string; name: string; code: string };
  section: {
    id: string;
    name: string;
    batchYear: number;
    department: { id: string; name: string; code: string };
    semester: { number: number; course: { name: string; code: string } };
  };
};

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function AdminAllocationsPage() {
  // refs
  const [faculty, setFaculty] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);

  // form
  const [facultyId, setFacultyId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setErr(null);
    setLoading(true);
    try {
      const [f, sub, sec, al] = await Promise.all([
        apiFetch<User[]>("/api/users?role=FACULTY"),
        apiFetch<Subject[]>("/api/master/subjects"),
        apiFetch<Section[]>("/api/master/sections"),
        apiFetch<AllocationRow[]>("/api/allocations"),
      ]);

      setFaculty(f);
      setSubjects(sub);
      setSections(sec);
      setAllocations(al);
    } catch (e: any) {
      setErr(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  const facultyOptions = useMemo(
    () => faculty.map((u) => ({ value: u.id, label: `${u.name} • ${u.email}` })),
    [faculty]
  );

  const subjectOptions = useMemo(
    () => subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code}) • ${s.credits} credits` })),
    [subjects]
  );

  const sectionOptions = useMemo(
    () =>
      sections.map((s) => ({
        value: s.id,
        label: `${s.department.code} • ${s.semester.course.code} • Sem ${s.semester.number} • ${s.name}-${s.batchYear}`,
      })),
    [sections]
  );

  async function createAllocation() {
    setErr(null);
    setBusy(true);
    try {
      await apiFetch("/api/allocations", {
        method: "POST",
        body: JSON.stringify({ facultyId, subjectId, sectionId }),
      });

      setFacultyId("");
      setSubjectId("");
      setSectionId("");

      const al = await apiFetch<AllocationRow[]>("/api/allocations");
      setAllocations(al);
    } catch (e: any) {
      setErr(e?.message || "Failed to create allocation");
    } finally {
      setBusy(false);
    }
  }

  async function removeAllocation(id: string) {
    setErr(null);
    try {
      await apiFetch(`/api/allocations/${id}`, { method: "DELETE" });
      const al = await apiFetch<AllocationRow[]>("/api/allocations");
      setAllocations(al);
    } catch (e: any) {
      setErr(e?.message || "Failed to delete allocation");
    }
  }

  return (
    <Protected allow={["ADMIN"]}>
      <AdminShell
        title="Allocations"
        subtitle="Allocate Faculty → Subject → Section. (Required for attendance and IA marks.)"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              Create and manage teaching allocations.
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
            {/* Create */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Create Allocation
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Map a faculty member to teach a subject in a specific section.
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-600">Faculty</label>
                    <select
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Select faculty</option>
                      {facultyOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Subject</label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="">Select subject</option>
                      {subjectOptions.map((o) => (
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

                  <button
                    onClick={createAllocation}
                    disabled={busy || !facultyId || !subjectId || !sectionId}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600 transition disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {busy ? "Creating..." : "Create Allocation"}
                  </button>
                </div>
              </TiltCard>
            </motion.div>

            {/* List */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-sm font-semibold text-slate-900">Allocations</div>
                <div className="text-xs text-slate-600 mt-1">
                  Total: {allocations.length}
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-left">Faculty</th>
                        <th className="py-2 text-left">Subject</th>
                        <th className="py-2 text-left">Section</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((a) => (
                        <tr key={a.id} className="border-b border-slate-100">
                          <td className="py-3">
                            <div className="font-medium text-slate-900">{a.faculty.name}</div>
                            <div className="text-xs text-slate-500">{a.faculty.email}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-medium text-slate-900">{a.subject.name}</div>
                            <div className="text-xs text-slate-500">{a.subject.code}</div>
                          </td>
                          <td className="py-3 text-slate-700">
                            <div className="font-medium text-slate-900">
                              {a.section.department.code} • {a.section.semester.course.code} • Sem {a.section.semester.number}
                            </div>
                            <div className="text-xs text-slate-500">
                              Section {a.section.name}-{a.section.batchYear}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => removeAllocation(a.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 transition"
                            >
                              <Trash2 className="h-4 w-4 text-slate-700" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {!loading && allocations.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">
                            No allocations yet. Create your first one.
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
