"use client";

import { motion } from "framer-motion";
import { Plus, RefreshCw, Trash2, Pencil, Database } from "lucide-react";
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
  endpoint: string;
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              {mode === "create" ? "Create" : "Edit"} {title}
            </h3>
            {mode === "edit" && (
              <button
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="space-y-3.5">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  {f.label}
                </label>

                {f.type === "select" ? (
                  <select
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                  />
                )}
              </div>
            ))}

            <button
              onClick={submit}
              disabled={busyId === "form"}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              {busyId === "form" ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </button>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
                {error}
              </div>
            )}
          </div>
        </motion.div>

        {/* List Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <Database className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">Records</h3>
            <span className="ml-auto text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  {listSecondaryKey && <th className="py-3 px-5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Meta</th>}
                  <th className="py-3 px-5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((it, idx) => (
                  <motion.tr
                    key={it.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">{it[listLabelKey] ?? "-"}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">ID: {it.id.slice(0, 12)}…</div>
                    </td>

                    {listSecondaryKey && (
                      <td className="py-3.5 px-5 text-slate-600">
                        {String(it[listSecondaryKey] ?? "-")}
                      </td>
                    )}

                    <td className="py-3.5 px-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(it)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => remove(it.id)}
                          disabled={busyId === it.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          {busyId === it.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={listSecondaryKey ? 3 : 2} className="py-12 text-center">
                      <Database className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No records yet. Create your first one.</p>
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
