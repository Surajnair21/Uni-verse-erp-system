"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useEffect, useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { UserCircle2, Lock, CheckCircle, AlertCircle, Building2 } from "lucide-react";

export default function HodProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    apiFetch<any>("/api/profile/me")
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setToast({ ok: false, msg: "New passwords don't match." });
      return;
    }
    if (newPw.length < 6) {
      setToast({ ok: false, msg: "Password must be at least 6 characters." });
      return;
    }

    setPwLoading(true);
    try {
      await apiFetch("/api/profile/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      setToast({ ok: true, msg: "Password updated successfully!" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: any) {
      setToast({ ok: false, msg: err.message || "Failed to change password." });
    } finally {
      setPwLoading(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  return (
    <Protected allow={["HOD"]}>
      <DashboardShell role="HOD" pageTitle="My Profile" pageSubtitle="Account information and password management">
        {loading ? (
          <div className="space-y-4">
            <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-lg flex items-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <UserCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">{profile?.name}</div>
                <div className="text-sm text-sky-100 mt-0.5 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {profile?.department?.name
                    ? `Head of ${profile.department.name} Department`
                    : "Department not assigned"}
                </div>
                {memberSince && <div className="text-xs text-sky-200 mt-1">Member since {memberSince}</div>}
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-800 text-sm">
                Account Information
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Full Name</div>
                  <div className="font-medium text-slate-800">{profile?.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</div>
                  <div className="font-medium text-slate-800">{profile?.email}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Role</div>
                  <div className="font-medium text-slate-800">
                    <span className="bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-sky-100">
                      {profile?.role}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Department</div>
                  <div className="font-medium text-slate-800">
                    {profile?.department?.name ?? "Not assigned"}
                    {profile?.department?.code && (
                      <span className="text-xs text-slate-400 ml-1">({profile.department.code})</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Password Change */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2 font-semibold text-slate-800 text-sm">
                <Lock className="w-4 h-4 text-slate-500" /> Change Password
              </div>
              <form onSubmit={handlePasswordChange} className="p-5 space-y-4 max-w-md">
                {toast && (
                  <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${toast.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {toast.msg}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                  <input type="password" required value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-sky-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                  <input type="password" required value={newPw} onChange={e => setNewPw(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-sky-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                  <input type="password" required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-sky-500 transition" />
                </div>
                <button type="submit" disabled={pwLoading}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </DashboardShell>
    </Protected>
  );
}
