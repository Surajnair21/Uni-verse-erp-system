"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    sectionId: string;
    day: string;
    hour: number;
    onSuccess: () => void;
};

export default function AssignSlotModal({ isOpen, onClose, sectionId, day, hour, onSuccess }: Props) {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);

    const [subjectId, setSubjectId] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [room, setRoom] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load form options
            Promise.all([
                apiFetch<any[]>("/api/master/subjects"),
                apiFetch<any[]>("/api/users?role=FACULTY")
            ]).then(([subData, facData]) => {
                setSubjects(subData);
                setFaculties(facData);
                if (subData.length) setSubjectId(subData[0].id);
                if (facData.length) setFacultyId(facData[0].id);
            });
        }
    }, [isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const startTimeStr = `${hour.toString().padStart(2, "0")}:00`;
        const endTimeStr = `${(hour + 1).toString().padStart(2, "0")}:00`;

        try {
            await apiFetch("/api/timetable", {
                method: "POST",
                body: JSON.stringify({
                    dayOfWeek: day,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    room: room || undefined,
                    sectionId,
                    subjectId,
                    facultyId,
                }),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message || "Failed to assign slot");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200"
                >
                    <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
                                <CalendarPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">Assign Slot</h3>
                                <p className="text-xs text-slate-500">
                                    {day} at {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select
                                required
                                value={subjectId}
                                onChange={(e) => setSubjectId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 p-2.5"
                            >
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Faculty</label>
                            <select
                                required
                                value={facultyId}
                                onChange={(e) => setFacultyId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 p-2.5"
                            >
                                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Lab 3"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-sky-500 focus:border-sky-500 p-2.5"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-sky-600 rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Assign"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
