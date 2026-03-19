"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import React from "react";

type Student = {
    id: string;
    name: string;
    email: string;
    rollNo?: string | null;
};

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
const STATUS_OPTIONS: Status[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

function statusPill(status: Status) {
    switch (status) {
        case "PRESENT": return "bg-green-100 text-green-800 border-green-200";
        case "ABSENT": return "bg-red-100 text-red-800 border-red-200";
        case "LATE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "EXCUSED": return "bg-blue-100 text-blue-800 border-blue-200";
    }
}

export default function MarkAttendancePage({ params }: { params: Promise<{ slotId: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const resolvedParams = React.use(params);
    const slotId = resolvedParams.slotId;
    const date = searchParams.get("date");
    const sectionId = searchParams.get("sectionId");
    const subjectId = searchParams.get("subjectId");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        let mounted = true;

        async function loadStudents() {
            if (!sectionId) return;
            try {
                setLoading(true);
                const data = await apiFetch<Student[]>(`/api/attendance/section/${sectionId}/students`);
                if (!mounted) return;

                setStudents(data || []);

                // Default all to PRESENT
                const next: Record<string, Status> = {};
                for (const s of data || []) next[s.id] = "PRESENT";
                setStatusMap(next);
            } catch (e: any) {
                setToast({ type: "error", msg: e.message || "Failed to load students" });
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadStudents();
        return () => { mounted = false; };
    }, [sectionId]);

    function setAll(status: Status) {
        const next: Record<string, Status> = {};
        for (const s of students) next[s.id] = status;
        setStatusMap(next);
    }

    async function onSave() {
        try {
            setSaving(true);
            setToast(null);

            await apiFetch<{ message: string }>(`/api/attendance/sessions`, {
                method: "POST",
                body: JSON.stringify({
                    date,
                    sectionId,
                    subjectId,
                    timetableSlotId: slotId,
                    records: students.map((s) => ({
                        studentId: s.id,
                        status: statusMap[s.id] || "PRESENT",
                    })),
                }),
            });

            setToast({ type: "success", msg: "Attendance saved successfully. Returning..." });
            setTimeout(() => router.push("/faculty/attendance"), 1500);

        } catch (e: any) {
            setToast({ type: "error", msg: e.message || "Failed to save attendance" });
        } finally {
            setSaving(false);
        }
    }

    if (!date || !sectionId || !subjectId) {
        return (
            <DashboardShell role="FACULTY" pageTitle="Error">
                <div className="p-10 text-center text-red-600">Missing required URL parameters. Please go back and select a class again.</div>
            </DashboardShell>
        );
    }

    return (
        <Protected allow={["FACULTY"]}>
            <DashboardShell
                role="FACULTY"
                pageTitle="Mark Session Attendance"
                pageSubtitle={`Class on ${date}`}
            >
                <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <button
                            onClick={() => router.push("/faculty/attendance")}
                            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                        >
                            Cancel & Go Back
                        </button>
                        <button
                            onClick={onSave}
                            disabled={saving || loading || students.length === 0}
                            className="px-6 py-2 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Attendance"}
                        </button>
                    </div>

                    {toast && (
                        <div className={`border rounded-xl px-4 py-3 ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                            {toast.msg}
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-800">Student Roster</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setAll("PRESENT")} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100">Make All Present</button>
                                <button onClick={() => setAll("ABSENT")} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100">Make All Absent</button>
                            </div>
                        </div>

                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            {loading ? (
                                <div className="p-10 text-center text-slate-400">Loading roster...</div>
                            ) : students.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">No students found in this section.</div>
                            ) : (
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="text-left text-slate-600 font-medium">
                                            <th className="py-3 px-4">Student</th>
                                            <th className="py-3 px-4 hidden sm:table-cell">Email</th>
                                            <th className="py-3 px-4">Roll No</th>
                                            <th className="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {students.map((s) => {
                                            const st = statusMap[s.id] || "PRESENT";
                                            return (
                                                <tr key={s.id} className="hover:bg-slate-50/50">
                                                    <td className="py-3 px-4 font-medium text-slate-900">{s.name}</td>
                                                    <td className="py-3 px-4 text-slate-500 hidden sm:table-cell">{s.email}</td>
                                                    <td className="py-3 px-4 text-slate-700">{s.rollNo || "-"}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-2 flex-wrap">
                                                            {STATUS_OPTIONS.map((opt) => (
                                                                <button
                                                                    key={opt}
                                                                    onClick={() => setStatusMap((prev) => ({ ...prev, [s.id]: opt }))}
                                                                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${opt === st ? statusPill(opt) : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"}`}
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
                            )}
                        </div>
                    </div>
                </div>
            </DashboardShell>
        </Protected>
    );
}
