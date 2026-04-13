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
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
        <div className="h-6 w-1/3 bg-slate-100 rounded animate-pulse" />
        <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
        <div className="h-16 bg-slate-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Bell className="w-4 h-4 text-amber-500" />
          Notice Board
        </div>
        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-bold">
          {notices.length} New
        </span>
      </div>
      
      {notices.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <Megaphone className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm">No notices published yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {notices.map((notice, i) => (
            <motion.div 
              key={notice.id} 
              initial={{ opacity: 0, y: 5 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 hover:bg-slate-50 transition"
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-slate-800 text-sm">{notice.title}</h4>
                <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2 shrink-0">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-2 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                <span>By {notice.author?.name} ({notice.author?.role})</span>
                {notice.audience !== 'ALL' && (
                  <span className="bg-indigo-50 text-indigo-500 px-1.5 rounded uppercase">
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
