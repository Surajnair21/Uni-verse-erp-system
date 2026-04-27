import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Bell, Megaphone } from "lucide-react";
import { motion } from "framer-motion";

export function NoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<any[]>("/api/notices");
        setNotices(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm p-5 space-y-3">
        <div className="h-6 w-1/3 bg-slate-100 rounded animate-pulse" />
        <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
        <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Accent top bar */}
      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />

      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
          </div>
          Notice Board
        </div>
        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold border border-amber-100">
          {notices.length} {notices.length === 1 ? "Notice" : "Notices"}
        </span>
      </div>
      
      {notices.length === 0 ? (
        <div className="p-10 text-center">
          <Megaphone className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">No notices published yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {notices.map((notice, i) => (
            <motion.div 
              key={notice.id} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 hover:bg-slate-50/60 transition"
            >
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="font-semibold text-slate-800 text-sm">{notice.title}</h4>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-3 shrink-0 font-medium">
                  {new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2.5 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-br from-indigo-400 to-sky-400 flex items-center justify-center text-white text-[8px] font-bold">
                    {notice.author?.name?.[0] || "?"}
                  </div>
                  {notice.author?.name} · {notice.author?.role}
                </span>
                {notice.audience !== 'ALL' && (
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase border border-indigo-100">
                    {notice.audience === 'DEPARTMENT' ? notice.department?.name : notice.audience}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
