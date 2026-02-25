"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import TiltCard from "@/components/ui/TiltCard";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { RefreshCw, BookOpenCheck, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function StudentHome() {
  const [loading, setLoading] = useState(false);

  const [me, setMe] = useState<any>(null);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const [profile, al] = await Promise.all([
        apiFetch("/api/students/me"),
        apiFetch<any[]>("/api/allocations"),
      ]);
      setMe(profile);
      setAllocations(al);
    } catch (e: any) {
      setErr(e?.message || "Failed to load student dashboard");
    } finally {                          
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const section = me?.studentProfile?.section;

  const subjects = useMemo(() => {
    const m = new Map<string, any>();
    for (const a of allocations) {
      if (a.subject?.id) m.set(a.subject.id, a.subject);
    }
    return Array.from(m.values());
  }, [allocations]);

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell
        role="STUDENT"
        pageTitle="Student Dashboard"
        pageSubtitle="Your section and subjects (Phase 1)"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">
              {section
                ? `Linked to: ${section.department?.code} • ${section.semester?.course?.code} • Sem ${section.semester?.number} • Section ${section.name}-${section.batchYear}`
                : "You are not linked to a section yet. Ask admin to assign your section."}
            </div>

            <button
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
            >
              <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </button>
          </div>

          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-white border border-slate-200 shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">My Section</div>
                    <div className="text-xs text-slate-600 mt-1">
                      Your academic mapping
                    </div>
                  </div>
                  <MapPin className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {section ? (
                    <>
                      <div className="text-sm font-semibold text-slate-900">
                        {section.department?.name} ({section.department?.code})
                      </div>
                      <div className="text-sm text-slate-700 mt-1">
                        {section.semester?.course?.name} ({section.semester?.course?.code})
                      </div>
                      <div className="text-sm text-slate-700 mt-1">
                        Semester {section.semester?.number} • Section {section.name}-{section.batchYear}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-700">
                      Not linked. Admin must assign your section.
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  Next: Attendance % and timetable will appear here.
                </div>
              </TiltCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <TiltCard className="rounded-2xl bg-linear-to-br from-sky-50 to-orange-50 border border-slate-200 shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">My Subjects</div>
                    <div className="text-xs text-slate-700 mt-1">
                      Based on faculty allocations
                    </div>
                  </div>
                  <BookOpenCheck className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-4 space-y-2">
                  {subjects.length > 0 ? (
                    subjects.map((s: any) => (
                      <div
                        key={s.id}
                        className="rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {s.name}
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {s.code} • {s.credits ?? "-"} credits
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      {section
                        ? "No subjects found yet. Admin needs to create allocations for your section."
                        : "Link your section first to view subjects."}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  Next: attendance and marks will be shown per subject.
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
