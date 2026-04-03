"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Building2, GraduationCap, Hash, Calendar,
  KeyRound, Eye, EyeOff, CheckCircle2, AlertTriangle, BookOpen,
} from "lucide-react";

type Profile = {
  id: string; name: string; email: string; role: string; createdAt: string;
  department?: { name: string; code: string } | null;
  studentProfile?: {
    rollNo?: string | null; batchYear?: number | null;
    section?: {
      name: string; batchYear: number;
      department?: { name: string; code: string } | null;
      semester?: { number: number; course?: { name: string; code: string } | null } | null;
    } | null;
  } | null;
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <div>
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="text-sm font-semibold text-slate-900 mt-0.5">{value ?? "—"}</div>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwToast, setPwToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    apiFetch<Profile>("/api/profile/me")
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwToast({ ok: false, msg: "New passwords do not match." }); return; }
    setPwSaving(true); setPwToast(null);
    try {
      await apiFetch("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      setPwToast({ ok: true, msg: "Password changed successfully!" });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (e: any) {
      setPwToast({ ok: false, msg: e.message || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  }

  const sp = profile?.studentProfile;
  const sec = sp?.section;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <Protected allow={["STUDENT"]}>
      <DashboardShell role="STUDENT" pageTitle="My Profile" pageSubtitle="Your account information and settings">
        <div className="space-y-6 max-w-2xl">
          {/* Avatar banner */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-violet-500 to-sky-600 p-6 text-white shadow-lg flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-5 w-40 rounded bg-white/30 animate-pulse" />
                  <div className="h-3 w-24 rounded bg-white/20 animate-pulse" />
                </div>
              ) : (
                <>
                  <div className="text-xl font-bold">{profile?.name}</div>
                  <div className="text-sm text-violet-100 mt-0.5">
                    {sec
                      ? `${sp?.rollNo ? `Roll: ${sp.rollNo} · ` : ""}${sec.department?.code ?? ""} · Sem ${sec.semester?.number ?? "?"} · Section ${sec.name}`
                      : "Not yet assigned to a section"}
                  </div>
                  {memberSince && <div className="text-xs text-violet-200 mt-1">Enrolled {memberSince}</div>}
                </>
              )}
            </div>
          </motion.div>

          {/* Personal info */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="text-sm font-bold text-slate-800 mb-2">Personal Information</div>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />)}</div>
            ) : (
              <>
                <InfoRow icon={User} label="Full Name" value={profile?.name} />
                <InfoRow icon={Mail} label="Email Address" value={profile?.email} />
                <InfoRow icon={Hash} label="Roll Number" value={sp?.rollNo} />
                <InfoRow icon={Calendar} label="Batch Year" value={sp?.batchYear} />
              </>
            )}
          </motion.div>

          {/* Academic info */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="text-sm font-bold text-slate-800 mb-2">Academic Details</div>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />)}</div>
            ) : sec ? (
              <>
                <InfoRow icon={Building2} label="Department" value={sec.department ? `${sec.department.name} (${sec.department.code})` : null} />
                <InfoRow icon={BookOpen} label="Course" value={sec.semester?.course?.name} />
                <InfoRow icon={GraduationCap} label="Semester" value={sec.semester?.number != null ? `Semester ${sec.semester.number}` : null} />
                <InfoRow icon={Hash} label="Section" value={`Section ${sec.name} (Batch ${sec.batchYear})`} />
              </>
            ) : (
              <div className="py-6 text-center text-slate-500 text-sm">
                You are not yet assigned to a section. Please contact the Admin.
              </div>
            )}
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
              <KeyRound className="w-4 h-4 text-violet-500" /> Change Password
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { label: "Current Password", val: currentPw, set: setCurrentPw, show: showCur, toggle: () => setShowCur(v => !v) },
                { label: "New Password", val: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(v => !v) },
                { label: "Confirm New Password", val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew(v => !v) },
              ].map(({ label, val, set, show, toggle }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">{label}</label>
                  <div className="relative">
                    <input type={show ? "text" : "password"} value={val}
                      onChange={e => set(e.target.value)} required
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-white focus:ring-2 focus:ring-violet-300 outline-none"
                      placeholder="••••••••" />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              {pwToast && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border ${pwToast.ok ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                  {pwToast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {pwToast.msg}
                </div>
              )}
              <button type="submit" disabled={pwSaving}
                className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-60 transition">
                {pwSaving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </motion.div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
