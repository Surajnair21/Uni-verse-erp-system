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
  Shield,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/master", label: "Master Data", icon: Layers3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/student-sections", label: "Student Sections", icon: Users },
  { href: "/admin/allocations", label: "Allocations", icon: BookOpen },
  { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
];

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getInitials(name?: string) {
  if (!name) return "A";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight">UniVerse ERP</div>
            <div className="text-xs text-white/80">Admin Console</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/70 leading-relaxed">
          Configure academic structure, users, and allocations
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-1">
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-amber-50 text-amber-800 shadow-sm border border-amber-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
              )}
            >
              <Icon className={cx(
                "h-[18px] w-[18px] flex-shrink-0",
                active ? "text-amber-600" : "text-slate-400"
              )} />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="mt-auto pt-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-800 truncate">{user?.name || "Admin"}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--uv-bg)" }}>
      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-800">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={cx(
        "fixed top-0 left-0 z-40 h-full w-72 transform bg-white border-r border-slate-200 p-4 transition-transform duration-300 md:hidden flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden md:flex md:flex-col sticky top-8 self-start rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {sidebarContent}
          </motion.aside>

          {/* Main */}
          <main className="min-w-0 space-y-5">
            <motion.header
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="rounded-2xl bg-white border border-slate-200/80 shadow-sm px-6 py-5"
            >
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              )}
            </motion.header>

            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {children}
            </motion.section>
          </main>
        </div>
      </div>
    </div>
  );
}
