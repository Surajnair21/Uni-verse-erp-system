import { useState, FormEvent, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Megaphone, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-semibold text-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <Megaphone className="w-4 h-4 text-indigo-600" />
            </div>
            Publish New Notice
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Title</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition bg-slate-50/50"
              placeholder="e.g. End Semester Exam Schedule"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Content</label>
            <textarea 
              required
              rows={4}
              value={content} 
              onChange={e => setContent(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition resize-none bg-slate-50/50"
              placeholder="Detailed notice information..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Audience</label>
              <select 
                value={audience} 
                onChange={e => setAudience(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition bg-slate-50/50"
              >
                <option value="ALL">Everyone &amp; Global</option>
                <option value="STUDENT">All Students</option>
                <option value="FACULTY">All Faculty</option>
                <option value="DEPARTMENT">Specific Department</option>
              </select>
            </div>
            {audience === "DEPARTMENT" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Target Department</label>
                <select 
                  required
                  value={departmentId} 
                  onChange={e => setDepartmentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition bg-slate-50/50"
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
              className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition border border-slate-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 flex items-center gap-2 transition shadow-sm disabled:opacity-50"
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
