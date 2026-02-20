"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Role = "ADMIN" | "HOD" | "FACULTY" | "STUDENT";

type Dept = { id: string; name: string; code: string };

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  studentProfile?: { rollNo?: string | null; batchYear?: number | null } | null;
  createdAt: string;
};

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function AdminUsersPage() {
  // refs
  const [departments, setDepartments] = useState<Dept[]>([]);

  // listing
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  // form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("FACULTY");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [rollNo, setRollNo] = useState("");
  const [batchYear, setBatchYear] = useState<string>("");

  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadRefs() {
    const d = await apiFetch<Dept[]>("/api/master/departments");
    setDepartments(d);
  }

  async function loadUsers() {
    setErr(null);
    setLoading(true);
    try {
      const query = roleFilter === "ALL" ? "" : `?role=${roleFilter}`;
      const data = await apiFetch<UserRow[]>(`/api/users${query}`);
      setUsers(data);
    } catch (e: any) {
      setErr(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRefs().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadUsers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((u) => {
      const dept = u.department?.name?.toLowerCase() || "";
      return (
        u.name.toLowerCase().includes(needle) ||
        u.email.toLowerCase().includes(needle) ||
        u.role.toLowerCase().includes(needle) ||
        dept.includes(needle)
      );
    });
  }, [users, q]);

  const deptOptions = useMemo(
    () => departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
    [departments]
  );

  const needsDept = role === "HOD" || role === "FACULTY";
  const isStudent = role === "STUDENT";

  async function createUser() {
    setErr(null);
    setBusy(true);
    try {
      const payload: any = {
        name,
        email,
        password,
        role,
      };

      if (needsDept) payload.departmentId = departmentId || null;

      if (isStudent) {
        payload.rollNo = rollNo || null;
        payload.batchYear = batchYear ? Number(batchYear) : null;
      }

      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // reset minimal
      setName("");
      setEmail("");
      setPassword("");
      setDepartmentId("");
      setRollNo("");
      setBatchYear("");

      await loadUsers();
    } catch (e: any) {
      setErr(e?.message || "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Protected allow={["ADMIN"]}>
      <AdminShell
        title="Users"
        subtitle="Create Admin, HOD, Faculty, and Student accounts. (Phase 1)"
      >
        <div className="space-y-5">
          {/* top controls */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="text-sm text-slate-700">Filter:</div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              >
                <option value="ALL">All roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="HOD">HOD</option>
                <option value="FACULTY">FACULTY</option>
                <option value="STUDENT">STUDENT</option>
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name / email / dept..."
                  className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <button
              onClick={loadUsers}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>

          {/* 3D layout */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
            {/* Create form */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-sm font-semibold text-slate-900">Create User</div>
                <div className="text-xs text-slate-600 mt-1">
                  Admin can create accounts. HOD/Faculty can be linked to a department.
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs text-slate-600">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="Dr. Faculty One"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="faculty1@jklu.com"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Password</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="HOD">HOD</option>
                      <option value="FACULTY">FACULTY</option>
                      <option value="STUDENT">STUDENT</option>
                    </select>
                  </div>

                  {needsDept && (
                    <div>
                      <label className="text-xs text-slate-600">Department</label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                      >
                        <option value="">Select department</option>
                        {deptOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-[11px] text-slate-500">
                        Required for HOD/Faculty (for scoping later).
                      </div>
                    </div>
                  )}

                  {isStudent && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-slate-600">Roll No (optional)</label>
                        <input
                          value={rollNo}
                          onChange={(e) => setRollNo(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                          placeholder="JKLU25CSE001"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">Batch Year (optional)</label>
                        <input
                          value={batchYear}
                          onChange={(e) => setBatchYear(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                          placeholder="2025"
                        />
                      </div>
                    </div>
                  )}

                  {err && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {err}
                    </div>
                  )}

                  <button
                    onClick={createUser}
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm text-white hover:bg-orange-600 transition disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {busy ? "Creating..." : "Create User"}
                  </button>
                </div>
              </TiltCard>
            </motion.div>

            {/* List */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-sm font-semibold text-slate-900">User Directory</div>
                <div className="text-xs text-slate-600 mt-1">
                  Showing {filtered.length} of {users.length}
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-slate-600">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 text-left">Name</th>
                        <th className="py-2 text-left">Role</th>
                        <th className="py-2 text-left">Department</th>
                        <th className="py-2 text-left">Student</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100">
                          <td className="py-3">
                            <div className="font-medium text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3">
                            <span
                              className={cx(
                                "inline-flex rounded-xl px-2 py-1 text-xs border",
                                u.role === "ADMIN" && "bg-sky-50 text-sky-700 border-sky-200",
                                u.role === "HOD" && "bg-orange-50 text-orange-700 border-orange-200",
                                u.role === "FACULTY" && "bg-slate-50 text-slate-700 border-slate-200",
                                u.role === "STUDENT" && "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-700">
                            {u.department ? `${u.department.name} (${u.department.code})` : "-"}
                          </td>
                          <td className="py-3 text-slate-700">
                            {u.role === "STUDENT"
                              ? `${u.studentProfile?.rollNo || "—"} • ${u.studentProfile?.batchYear || "—"}`
                              : "-"}
                          </td>
                        </tr>
                      ))}

                      {!loading && filtered.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">
                            No users found.
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
