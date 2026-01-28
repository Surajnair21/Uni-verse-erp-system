"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Building2,
  Layers3,
  BookOpen,
  CalendarDays,
  Users,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/master", label: "Master Data", icon: Layers3 },
  { href: "/admin/users", label: "Users (next)", icon: Users, disabled: true },
];

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Better active detection for nested routes
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div
      className="min-h-screen text-slate-800"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      {/* soft ambient accents */}
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
            {/* ✅ FIX: remove 3D transform from this card (it caused the diagonal glitch) */}
            <div className="rounded-xl border border-slate-200 bg-linear-to-br from-sky-50 to-orange-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 ring-1 ring-orange-200">
                  <Building2 className="h-5 w-5 text-orange-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    JKLU ERP
                  </div>
                  <div className="text-xs text-slate-600">
                    Admin Console • Jaipur
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-600 leading-relaxed">
                Setup academic structure and admin controls for day-to-day college operations.
              </div>
            </div>

            <div className="mt-5 space-y-1">
              {nav.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
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
              <div className="mt-1 text-sm font-medium text-slate-900">
                {user?.name || "Admin"}
              </div>
              <div className="text-xs text-slate-600">{user?.email}</div>

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

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-600">
              <BookOpen className="h-4 w-4" />
              <span>Master Data • Attendance • Results (phased)</span>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <CalendarDays className="h-4 w-4" />
              <span>Phase 1: Admin setup</span>
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
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
                  )}
                </div>

                <div className="text-xs text-slate-600">
                  Built for JKLU workflows (Dept → Program → Course → Semester → Section)
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
