"use client";

import { motion } from "framer-motion";
import { Plus, RefreshCw, Trash2, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";

type Field =
  | { key: string; label: string; type: "text" | "number"; placeholder?: string }
  | {
      key: string;
      label: string;
      type: "select";
      placeholder?: string;
      options: Array<{ label: string; value: string }>;
    };

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function MasterEntityPanel({
  title,
  subtitle,
  endpoint,
  fields,
  listLabelKey = "name",
  listSecondaryKey,
}: {
  title: string;
  subtitle?: string;
  endpoint: string; // e.g. /api/master/departments
  fields: Field[];
  listLabelKey?: string;
  listSecondaryKey?: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initialForm = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const f of fields) obj[f.key] = "";
    return obj;
  }, [fields]);

  const [form, setForm] = useState<Record<string, any>>(initialForm);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(endpoint);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  function startEdit(item: any) {
    setMode("edit");
    setEditId(item.id);
    const next = { ...initialForm };
    for (const f of fields) next[f.key] = item[f.key] ?? "";
    setForm(next);
  }

  function resetForm() {
    setMode("create");
    setEditId(null);
    setForm(initialForm);
  }

  async function submit() {
    setError(null);
    setBusyId("form");
    try {
      const payload: any = {};
      for (const f of fields) {
        let v = form[f.key];

        // number casting
        if (f.type === "number" && v !== "") v = Number(v);

        payload[f.key] = v;
      }

      if (mode === "create") {
        await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`${endpoint}/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      }

      resetForm();
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setError(null);
    setBusyId(id);
    try {
      await apiFetch(`${endpoint}/${id}`, { method: "DELETE" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {subtitle && <div className="text-sm text-slate-300">{subtitle}</div>}
        </div>

        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* 3D Card */}
      <div
        className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-linear-to-br from-white/10 to-white/5 p-4"
          style={{
            transform: "perspective(900px) rotateY(-2deg)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">
              {mode === "create" ? "Create" : "Edit"} {title}
            </div>
            {mode === "edit" && (
              <button
                onClick={resetForm}
                className="text-xs text-slate-300 hover:text-white transition"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="mt-3 space-y-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-slate-300">{f.label}</label>

                {f.type === "select" ? (
                  <select
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/30"
                  >
                    <option value="">{f.placeholder || "Select..."}</option>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    type={f.type}
                    placeholder={f.placeholder}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400/30"
                  />
                )}
              </div>
            ))}

            <button
              onClick={submit}
              disabled={busyId === "form"}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500/20 ring-1 ring-orange-400/30 px-3 py-2 text-sm font-medium hover:bg-orange-500/25 transition disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {busyId === "form" ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* List */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
          style={{
            transform: "perspective(900px) rotateY(1deg)",
          }}
        >
          <div className="text-sm font-semibold">Records</div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-white/10">
                  <th className="py-2 text-left">Name</th>
                  {listSecondaryKey && <th className="py-2 text-left">Meta</th>}
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-white/5">
                    <td className="py-3">
                      <div className="font-medium">{it[listLabelKey] ?? "-"}</div>
                      <div className="text-xs text-slate-400">ID: {it.id}</div>
                    </td>

                    {listSecondaryKey && (
                      <td className="py-3 text-slate-200">
                        {String(it[listSecondaryKey] ?? "-")}
                      </td>
                    )}

                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(it)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => remove(it.id)}
                          disabled={busyId === it.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {busyId === it.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={listSecondaryKey ? 3 : 2} className="py-8 text-center text-slate-400">
                      No records yet. Create your first one on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
