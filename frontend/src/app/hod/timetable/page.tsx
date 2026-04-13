"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import TimetableGrid from "@/components/admin/TimetableGrid";
import { CalendarDays, BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HodTimetablePage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const allSecs = await apiFetch<any[]>("/api/master/sections");
        const myDeptSecs = allSecs.filter(s => s.departmentId === user?.departmentId);
        setSections(myDeptSecs);
        if (myDeptSecs.length > 0) {
          setSelectedSection(myDeptSecs[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user?.departmentId) {
      load();
    }
  }, [user]);

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell
        role="HOD"
        pageTitle="Department Timetable"
        pageSubtitle="View class schedules for all sections in your department"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-500" />
                Select Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full max-w-md border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 outline-none focus:border-sky-500 transition"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Batch {s.batchYear})</option>
                ))}
              </select>
            </div>
            {selectedSection && (
              <div className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium text-sm rounded-xl border border-indigo-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Showing Timetable
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-64 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
          ) : selectedSection ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TimetableGrid sectionId={selectedSection} readOnly={true} />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-100 rounded-2xl">
              No sections found for your department.
            </div>
          )}
        </div>
      </DashboardShell>
    </Protected>
  );
}
