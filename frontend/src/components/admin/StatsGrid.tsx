"use client";

import { motion } from "framer-motion";
import { Building2, Layers3, BookOpen, Shapes, UsersRound, Users, CalendarDays } from "lucide-react";

export default function StatsGrid({
  stats,
  loading = false,
}: {
  stats: {
    departments: number;
    programs: number;
    courses: number;
    subjects: number;
    sections: number;
    users?: number;
    timetableSlots?: number;
  };
  loading?: boolean;
}) {
  const items = [
    { key: "departments",    label: "Departments",     value: stats.departments,           icon: Building2,    gradient: "from-indigo-500 to-indigo-600",  bg: "bg-indigo-50",  text: "text-indigo-700" },
    { key: "programs",       label: "Programs",         value: stats.programs,              icon: Layers3,      gradient: "from-sky-500 to-sky-600",        bg: "bg-sky-50",     text: "text-sky-700" },
    { key: "courses",        label: "Courses",          value: stats.courses,               icon: BookOpen,     gradient: "from-emerald-500 to-emerald-600",bg: "bg-emerald-50", text: "text-emerald-700" },
    { key: "subjects",       label: "Subjects",         value: stats.subjects,              icon: Shapes,       gradient: "from-violet-500 to-violet-600",  bg: "bg-violet-50",  text: "text-violet-700" },
    { key: "sections",       label: "Sections",         value: stats.sections,              icon: UsersRound,   gradient: "from-amber-500 to-amber-600",    bg: "bg-amber-50",   text: "text-amber-700" },
    { key: "users",          label: "Users",            value: stats.users ?? 0,            icon: Users,        gradient: "from-teal-500 to-teal-600",      bg: "bg-teal-50",    text: "text-teal-700" },
    { key: "timetableSlots", label: "Timetable Slots",  value: stats.timetableSlots ?? 0,   icon: CalendarDays, gradient: "from-rose-500 to-rose-600",      bg: "bg-rose-50",    text: "text-rose-700" },
  ] as const;

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {items.map((it, idx) => {
        const Icon = it.icon;

        return (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
          >
            {/* Subtle accent top bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${it.gradient} rounded-t-2xl`} />

            <div className="flex items-start justify-between mt-1">
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${it.gradient} text-white shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {it.value}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-500">
              {it.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
