"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  LogOut,
  Layers3,
  ClipboardList,
  CalendarDays,
  BarChart2,
  UserCircle2,
  Award,
  FileText,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Role = "HOD" | "FACULTY" | "STUDENT";

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function roleMeta(role: Role) {
  if (role === "HOD")
    return {
      title: "HOD Portal",
      subtitle: "Department dashboard • view structure & allocations",
      nav: [
        { href: "/hod", label: "Overview", icon: LayoutGrid },
        { href: "/hod/allocations", label: "Allocations", icon: ClipboardList },
        { href: "/hod/timetable", label: "Dept Timetable", icon: CalendarDays },
        { href: "/hod/flagged", label: "Flagged Students", icon: UserX },
        { href: "/hod/reports", label: "Result Reports", icon: FileText },
        { href: "/hod/master", label: "Master Data (view)", icon: Layers3 },
        { href: "/hod/profile", label: "My Profile", icon: UserCircle2 },
      ],
    };

  if (role === "FACULTY")
    return {
      title: "Faculty Portal",
      subtitle: "Your teaching allocations • upcoming attendance/marks",
      nav: [
        { href: "/faculty", label: "Overview", icon: LayoutGrid },
        { href: "/faculty/attendance", label: "Attendance", icon: ClipboardList },
        { href: "/faculty/timetable", label: "Timetable", icon: CalendarDays },
        { href: "/faculty/ia", label: "IA Marks", icon: BarChart2 },
        { href: "/faculty/reports", label: "Result Reports", icon: FileText },
        { href: "/faculty/profile", label: "My Profile", icon: UserCircle2 },
      ],
    };

  return {
    title: "Student Portal",
    subtitle: "Your academics • attendance & results (phased)",
    nav: [
      { href: "/student", label: "Overview", icon: LayoutGrid },
      { href: "/student/attendance", label: "My Attendance", icon: ClipboardList },
      { href: "/student/timetable", label: "Timetable", icon: CalendarDays },
      { href: "/student/ia", label: "IA Marks", icon: BarChart2 },
      { href: "/student/results", label: "My Results", icon: Award },
      { href: "/student/profile", label: "My Profile", icon: UserCircle2 },
    ],
  };
}

export default function DashboardShell({
  role,
  pageTitle,
  pageSubtitle,
  children,
}: {
  role: Role;
  pageTitle: string;
  pageSubtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const meta = roleMeta(role);

  const isActive = (href: string) => {
    if (href === `/${role.toLowerCase()}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      {/* ambient accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-44 -left-44 h-112 w-md rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-44 -right-44 h-112 w-md rounded-full bg-orange-300/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4"
          >
            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-sky-50 to-orange-50 p-4">
              <div className="text-sm font-semibold text-slate-900">JKLU ERP</div>
              <div className="text-xs text-slate-600 mt-1">{meta.title}</div>
              <div className="text-xs text-slate-600 mt-2 leading-relaxed">
                {meta.subtitle}
              </div>
            </div>

            <div className="mt-5 space-y-1">
              {meta.nav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const disabled = (item as any).disabled;

                return (
                  <Link
                    key={item.href}
                    href={disabled ? "#" : item.href}
                    className={cx(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition border",
                      active
                        ? "bg-sky-50 border-sky-200 text-slate-900"
                        : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-800",
                      disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    <Icon className="h-4 w-4 text-slate-700" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">Signed in as</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-600">{user?.email}</div>
              <div className="text-xs text-slate-600 mt-1">Role: {user?.role}</div>

              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50 transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </motion.aside>

          {/* Main */}
          <main className="space-y-5">
            <motion.header
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {pageTitle}
                  </h1>
                  {pageSubtitle && (
                    <p className="mt-1 text-sm text-slate-600">{pageSubtitle}</p>
                  )}
                </div>

                <div className="text-xs text-slate-600">
                  Blue = structure • Orange = actions
                </div>
              </div>
            </motion.header>

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
            >
              {children}
            </motion.section>
          </main>
        </div>
      </div>
    </div>
  );
}
