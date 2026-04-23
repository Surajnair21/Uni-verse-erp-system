"use client";

import Protected from "@/components/Protected";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { apiFetch } from "@/lib/api";
import { useState, useEffect } from "react";
import { CheckCircle, Calculator, ChevronRight } from "lucide-react";

export default function FacultyReports() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculatingFor, setCalculatingFor] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchSections() {
      try {
        const allocations = await apiFetch<any[]>("/api/allocations");
        // Derive unique sections from faculty's own allocations
        const seen = new Set<string>();
        const uniqueSections: any[] = [];
        for (const a of allocations) {
          if (a.section && !seen.has(a.section.id)) {
            seen.add(a.section.id);
            uniqueSections.push(a.section);
          }
        }
        setSections(uniqueSections);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSections();
  }, []);

  const handleCalculate = async (sectionId: string) => {
    if (!confirm("Are you sure? This will finalize internal marks and calculate SGPA for all students in this section based on current IA marks.")) return;
    setCalculatingFor(sectionId);
    try {
      await apiFetch("/api/results/calculate", {
        method: "POST",
        body: JSON.stringify({ sectionId })
      });
      alert("Results calculated and published to students successfully!");
    } catch (e: any) {
      alert("Error calculating results: " + e.message);
    } finally {
      setCalculatingFor(null);
    }
  };

  return (
    <Protected allow={["FACULTY"]}>
      <DashboardShell role="FACULTY" pageTitle="Result Reports" pageSubtitle="Calculate and publish academic results">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Available Sections</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">Auto-Calculate SGPA via IA Marks</span>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Loading sections...</div>
            ) : sections.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No sections found.</div>
            ) : (
              sections.map((sec) => (
                <div key={sec.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{sec.semester?.course?.code} - Sem {sec.semester?.number} Section {sec.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{sec.department?.name} Department • Batch {sec.batchYear}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      disabled={calculatingFor === sec.id}
                      onClick={() => handleCalculate(sec.id)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-medium text-sm transition"
                    >
                      {calculatingFor === sec.id ? (
                        <>Processing...</>
                      ) : (
                        <><Calculator className="w-4 h-4" /> Calculate & Publish</>
                      )}
                    </button>
                    {/* Placeholder for PDF export (Priority 3) */}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardShell>
    </Protected>
  );
}
