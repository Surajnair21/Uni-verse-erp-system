"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import AssignSlotModal from "./AssignSlotModal";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9);

function formatHour(hour: number) {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour > 12 ? hour - 12 : hour;
    return `${h}:00 ${ampm}`;
}

const SLOT_COLORS = [
    { bg: "bg-indigo-50", border: "border-indigo-100", title: "text-indigo-900", code: "text-indigo-600", shadow: "shadow-indigo-100/50" },
    { bg: "bg-sky-50",    border: "border-sky-100",    title: "text-sky-900",    code: "text-sky-600",    shadow: "shadow-sky-100/50" },
    { bg: "bg-emerald-50",border: "border-emerald-100",title: "text-emerald-900",code: "text-emerald-600",shadow: "shadow-emerald-100/50" },
    { bg: "bg-violet-50", border: "border-violet-100", title: "text-violet-900", code: "text-violet-600", shadow: "shadow-violet-100/50" },
    { bg: "bg-amber-50",  border: "border-amber-100",  title: "text-amber-900",  code: "text-amber-600",  shadow: "shadow-amber-100/50" },
    { bg: "bg-rose-50",   border: "border-rose-100",   title: "text-rose-900",   code: "text-rose-600",   shadow: "shadow-rose-100/50" },
];

function getSlotColor(subjectId: string) {
    let hash = 0;
    for (let i = 0; i < subjectId.length; i++) hash = subjectId.charCodeAt(i) + ((hash << 5) - hash);
    return SLOT_COLORS[Math.abs(hash) % SLOT_COLORS.length];
}

export default function TimetableGrid({ sectionId, readOnly = false }: { sectionId: string, readOnly?: boolean }) {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedHour, setSelectedHour] = useState(0);

    async function loadSlots() {
        setLoading(true);
        try {
            const data = await apiFetch<any[]>(`/api/timetable?sectionId=${sectionId}`);
            setSlots(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        if (sectionId) loadSlots();
    }, [sectionId]);

    async function handleDelete(slotId: string) {
        if (!confirm("Remove this slot?")) return;
        try {
            await apiFetch(`/api/timetable/${slotId}`, { method: "DELETE" });
            loadSlots();
        } catch (e) {
            console.error(e);
            alert("Failed to delete slot");
        }
    }

    const openModal = (day: string, hour: number) => {
        setSelectedDay(day);
        setSelectedHour(hour);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-white border border-slate-200/80 text-sm rounded-2xl overflow-x-auto shadow-sm">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_repeat(6,minmax(140px,1fr))] border-b border-slate-200 bg-slate-50/80">
                <div className="p-3 font-medium text-slate-400 border-r border-slate-200 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                </div>
                {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center font-semibold text-slate-700 tracking-wide text-xs">
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
                    Loading timetable...
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-[80px_repeat(6,minmax(140px,1fr))] group hover:bg-slate-50/30 transition-colors">
                            <div className="p-3 text-xs font-medium text-slate-500 border-r border-slate-100 flex items-center justify-center bg-slate-50/30">
                                {formatHour(hour)}
                            </div>

                            {DAYS.map((day) => {
                                const startTimeStr = `${hour.toString().padStart(2, "0")}:00`;
                                const slot = slots.find((s) => s.dayOfWeek === day && s.startTime === startTimeStr);
                                const colors = slot ? getSlotColor(slot.subjectId || slot.id) : null;

                                return (
                                    <div key={`${day}-${hour}`} className="relative p-1.5 h-24 border-r border-slate-50 last:border-r-0">
                                        <AnimatePresence mode="popLayout">
                                            {slot && colors ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className={`h-full w-full rounded-xl ${colors.bg} border ${colors.border} p-2.5 flex flex-col justify-between group/card shadow-sm hover:shadow-md transition-shadow`}
                                                >
                                                    <div>
                                                        <div className={`font-semibold ${colors.title} text-xs truncate`} title={slot.subject.name}>
                                                            {slot.subject.name}
                                                        </div>
                                                        <div className={`text-[10px] ${colors.code} font-medium truncate`}>
                                                            {slot.subject.code}
                                                        </div>
                                                        <div className="text-xs text-slate-600 mt-1 truncate">
                                                            {slot.faculty.name}
                                                        </div>
                                                    </div>

                                                    {!readOnly && (
                                                        <button
                                                            onClick={() => handleDelete(slot.id)}
                                                            className="absolute bottom-1.5 right-1.5 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-200"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </motion.div>
                                            ) : (
                                                !readOnly && (
                                                    <div
                                                        onClick={() => openModal(day, hour)}
                                                        className="h-full w-full rounded-xl border-2 border-dashed border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 flex items-center justify-center cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Plus className="w-4 h-4 text-indigo-400" />
                                                    </div>
                                                )
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && (
                <AssignSlotModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    sectionId={sectionId}
                    day={selectedDay}
                    hour={selectedHour}
                    onSuccess={loadSlots}
                />
            )}
        </div>
    );
}
