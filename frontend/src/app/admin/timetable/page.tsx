"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import TimetableGrid from "@/components/admin/TimetableGrid";

export default function AdminTimetablePage() {
    const [sections, setSections] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        apiFetch<any[]>("/api/master/sections").then((res) => {
            setSections(res);
            if (res.length > 0) setSelectedSection(res[0].id);
        }).catch(console.error);
    }, []);

    return (
        <Protected allow={["ADMIN"]}>
            <AdminShell title="Timetable Management" subtitle="Manage weekly schedules for individual sections.">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                            Select Section:
                        </label>
                        <select
                            className="bg-white border flex-1 border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                        >
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.name} (Batch {section.batchYear}) - {section.department.code} - Sem {section.semester.number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-4">
                        {selectedSection ? (
                            <TimetableGrid sectionId={selectedSection} />
                        ) : (
                            <div className="text-center text-slate-500 p-10 border border-dashed rounded-xl border-slate-300">
                                Please create a section in Master Data first.
                            </div>
                        )}
                    </div>
                </div>
            </AdminShell>
        </Protected>
    );
}
