"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Trash2, BookMarked, ClipboardCheck, ChevronRight, X, Loader2
} from "lucide-react";
import Link from "next/link";

const COMPONENT_TYPES = ["QUIZ", "ASSIGNMENT", "MIDTERM", "PROJECT", "PRACTICAL"];

const TYPE_COLOR: Record<string, string> = {
  QUIZ:       "bg-sky-100 text-sky-700 border-sky-200",
  ASSIGNMENT: "bg-purple-100 text-purple-700 border-purple-200",
  MIDTERM:    "bg-orange-100 text-orange-700 border-orange-200",
  PROJECT:    "bg-teal-100 text-teal-700 border-teal-200",
  PRACTICAL:  "bg-rose-100 text-rose-700 border-rose-200",
};

export default function FacultyIAPage() {
  const [sections, setSections]     = useState<any[]>([]);
  const [subjects, setSubjects]     = useState<any[]>([]);
  const [sectionId, setSectionId]   = useState("");
  const [subjectId, setSubjectId]   = useState("");
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);

  // Create form state
  const [showForm, setShowForm]         = useState(false);
  const [formName, setFormName]         = useState("");
  const [formType, setFormType]         = useState(COMPONENT_TYPES[0]);
  const [formMax, setFormMax]           = useState<number>(20);
  const [formWeight, setFormWeight]     = useState<number | "">("");
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState<{ ok: boolean; msg: string } | null>(null);

  // 1) Derive sections the faculty is allocated to (from their own allocations)
  useEffect(() => {
    apiFetch<any[]>("/api/allocations")
      .then(allocations => {
        const seen = new Set<string>();
        const uniqueSections: any[] = [];
        for (const a of allocations) {
          if (a.section && !seen.has(a.section.id)) {
            seen.add(a.section.id);
            uniqueSections.push(a.section);
          }
        }
        setSections(uniqueSections);
      })
      .catch(() => {});
  }, []);

  // 2) Load subjects for the selected section — derived from faculty's own allocations
  useEffect(() => {
    if (!sectionId) { setSubjects([]); setSubjectId(""); return; }
    apiFetch<any[]>("/api/allocations")
      .then(allocations => {
        // Filter to allocations for this section and extract unique subjects
        const forSection = allocations.filter((a: any) => a.sectionId === sectionId);
        const seen = new Set<string>();
        const uniqueSubjects: any[] = [];
        for (const a of forSection) {
          if (a.subject && !seen.has(a.subject.id)) {
            seen.add(a.subject.id);
            uniqueSubjects.push(a.subject);
          }
        }
        setSubjects(uniqueSubjects);
        setSubjectId(""); // reset subject when section changes
      })
      .catch(() => {});
  }, [sectionId]);

  // 3) Load components
  async function loadComponents() {
    if (!sectionId || !subjectId) return;
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(`/api/ia?sectionId=${sectionId}&subjectId=${subjectId}`);
      setComponents(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadComponents(); }, [sectionId, subjectId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      await apiFetch("/api/ia", {
        method: "POST",
        body: JSON.stringify({
          name: formName, type: formType, maxMarks: formMax,
          weightage: formWeight === "" ? undefined : formWeight,
          subjectId, sectionId,
        }),
      });
      setToast({ ok: true, msg: "Component created!" });
      setFormName(""); setShowForm(false);
      loadComponents();
    } catch (e: any) {
      setToast({ ok: false, msg: e.message || "Failed to create" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this component and all its marks?")) return;
    try {
      await apiFetch(`/api/ia/${id}`, { method: "DELETE" });
      loadComponents();
    } catch (e: any) {
      alert(e.message || "Failed to delete");
    }
  }

  return (
    <Protected allow={["FACULTY", "ADMIN"]}>
      <DashboardShell role="FACULTY" pageTitle="IA Marks" pageSubtitle="Create assessments and enter student marks.">
        <div className="space-y-6">
          {toast && (
            <div className={`rounded-xl px-4 py-3 border text-sm font-medium flex items-center justify-between ${toast.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
              {toast.msg}
              <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-slate-600">Section</label>
              <select value={sectionId} onChange={e => setSectionId(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm">
                <option value="">Select section...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Batch {s.batchYear}) — {s.department?.code}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-slate-600">Subject</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 bg-white text-sm" disabled={!sectionId}>
                <option value="">Select subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            {sectionId && subjectId && (
              <div className="flex items-end">
                <button onClick={() => setShowForm(v => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 transition">
                  <PlusCircle className="w-4 h-4" />
                  New Component
                </button>
              </div>
            )}
          </div>

          {/* Create Form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                onSubmit={handleCreate}
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white border border-sky-200 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="text-sm font-bold text-slate-800 mb-1">New Assessment Component</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Name</label>
                    <input value={formName} onChange={e => setFormName(e.target.value)} required
                      placeholder="e.g. Quiz 1"
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Type</label>
                    <select value={formType} onChange={e => setFormType(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                      {COMPONENT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Max Marks</label>
                    <input type="number" min={1} value={formMax} onChange={e => setFormMax(Number(e.target.value))} required
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-600">Weightage % (optional)</label>
                    <input type="number" min={0} max={100} value={formWeight === "" ? "" : formWeight}
                      onChange={e => setFormWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 20"
                      className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Saving..." : "Create"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Components List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-64">
            {!sectionId || !subjectId ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <BookMarked className="w-10 h-10 mb-3 text-slate-200" />
                <p>Select a section and subject to view assessments.</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
              </div>
            ) : components.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <ClipboardCheck className="w-10 h-10 mb-3 text-slate-200" />
                <p>No assessment components yet. Create one above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {components.map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${TYPE_COLOR[c.type] || "bg-slate-100 text-slate-600"}`}>
                          {c.type}
                        </span>
                        <h3 className="font-bold text-slate-900 mt-2">{c.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">Max: {c.maxMarks} marks{c.weightage ? ` • ${c.weightage}% weightage` : ""}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.marks?.length ?? 0} marks entered</p>
                      </div>
                      <button onClick={() => handleDelete(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Link href={`/faculty/ia/${c.id}?sectionId=${sectionId}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition">
                      Enter Marks <ChevronRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
