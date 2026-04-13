import { useState, FormEvent, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Megaphone, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PublishNoticeModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await apiFetch<any[]>("/api/master/departments");
        setDepartments(depts);
      } catch (e) {
        console.error("Failed to load departments", e);
      }
    }
    loadDepts();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify({ 
          title, 
          content, 
          audience, 
          departmentId: audience === "DEPARTMENT" ? departmentId : undefined 
        })
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to publish notice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Megaphone className="w-5 h-5 text-indigo-500" />
            Publish New Notice
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              placeholder="e.g. End Semester Exam Schedule"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
            <textarea 
              required
              rows={4}
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              placeholder="Detailed notice information..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
              <select 
                value={audience} 
                onChange={e => setAudience(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white"
              >
                <option value="ALL">Everyone & Global</option>
                <option value="STUDENT">All Students</option>
                <option value="FACULTY">All Faculty</option>
                <option value="DEPARTMENT">Specific Department</option>
              </select>
            </div>
            {audience === "DEPARTMENT" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Department</label>
                <select 
                  required
                  value={departmentId} 
                  onChange={e => setDepartmentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-white"
                >
                  <option value="">Select Dept...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </motion.div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 flex-wrap">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publish Notice
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
