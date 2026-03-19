"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 9); // 9 to 17 (9 AM to 5 PM)

function formatHour(hour: number) {
    const ampm = hour >= 12 ? "PM" : "AM";
    const h = hour > 12 ? hour - 12 : hour;
    return `${h}:00 ${ampm}`;
}

export default function ReadOnlyTimetableGrid() {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadSlots() {
        setLoading(true);
        try {
            const data = await apiFetch<any[]>("/api/timetable");
            setSlots(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadSlots();
    }, []);

    return (
        <div className="bg-white border text-sm border-slate-200 rounded-xl overflow-x-auto shadow-sm">
            {/* Header Row */}
            <div className="grid grid-cols-[80px_repeat(6,minmax(140px,1fr))] border-b border-slate-200 bg-slate-50">
                <div className="p-3 font-medium text-slate-500 border-r border-slate-200 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                </div>
                {DAYS.map((day) => (
                    <div key={day} className="p-3 text-center font-semibold text-slate-700 tracking-wide text-xs">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Body */}
            {loading ? (
                <div className="p-10 text-center animate-pulse text-slate-400">Loading timetable...</div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {HOURS.map((hour) => (
                        <div key={hour} className="grid grid-cols-[80px_repeat(6,minmax(140px,1fr))] hover:bg-slate-50/50 transition-colors">
                            {/* Time Column */}
                            <div className="p-3 text-xs font-medium text-slate-500 border-r border-slate-200 flex items-center justify-center bg-slate-50/50">
                                {formatHour(hour)}
                            </div>

                            {/* Day Columns for this Hour */}
                            {DAYS.map((day) => {
                                const startTimeStr = `${hour.toString().padStart(2, "0")}:00`;
                                const slot = slots.find((s) => s.dayOfWeek === day && s.startTime === startTimeStr);

                                return (
                                    <div key={`${day}-${hour}`} className="relative p-2 h-26 border-r border-slate-100 last:border-r-0">
                                        <AnimatePresence mode="popLayout">
                                            {slot ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="h-full w-full rounded-lg bg-indigo-50 border border-indigo-100 p-2 flex flex-col justify-between shadow-sm"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-indigo-900 text-xs truncate" title={slot.subject.name}>
                                                            {slot.subject.name}
                                                        </div>
                                                        <div className="text-[10px] text-indigo-600 font-medium truncate">
                                                            {slot.subject.code}
                                                        </div>
                                                    </div>

                                                    <div className="mt-1">
                                                        <div className="text-[11px] text-slate-700 font-medium truncate">
                                                            {slot.faculty.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 truncate">
                                                            Section {slot.section.name}
                                                            {slot.room ? ` • ${slot.room}` : ""}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    {/* Empty Block Indicator */}
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
