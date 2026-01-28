"use client";

import Protected from "@/components/Protected";
import AdminShell from "@/components/admin/AdminShell";
import MasterEntityPanel from "@/components/admin/MasterEntityPanel";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type Dept = { id: string; name: string; code: string };
type Program = { id: string; name: string; code: string; departmentId: string };
type Course = { id: string; name: string; code: string; programId: string };

const tabs = [
  { key: "departments", label: "Departments" },
  { key: "programs", label: "Programs" },
  { key: "courses", label: "Courses" },
  { key: "subjects", label: "Subjects" },
  { key: "semesters", label: "Semesters" },
  { key: "sections", label: "Sections" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function MasterDataPage() {
  const [tab, setTab] = useState<TabKey>("departments");

  // reference lists for selects
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  async function loadRefs() {
    const [d, p, c] = await Promise.all([
      apiFetch<Dept[]>("/api/master/departments"),
      apiFetch<Program[]>("/api/master/programs"),
      apiFetch<Course[]>("/api/master/courses"),
    ]);
    setDepartments(d);
    setPrograms(p);
    setCourses(c);
  }

  useEffect(() => {
    // loads for select dropdowns
    loadRefs().catch(() => {});
  }, [tab]);

  const deptOptions = useMemo(
    () => departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.id })),
    [departments]
  );

  const programOptions = useMemo(
    () => programs.map((p) => ({ label: `${p.name} (${p.code})`, value: p.id })),
    [programs]
  );

  const courseOptions = useMemo(
    () => courses.map((c) => ({ label: `${c.name} (${c.code})`, value: c.id })),
    [courses]
  );

  return (
    <Protected allow={["ADMIN"]}>
      <AdminShell
        title="Master Data"
        subtitle="Set up the academic structure used across attendance, assessments, results, and reports."
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cx(
                "rounded-xl px-3 py-2 text-sm transition border",
                tab === t.key
                  ? "bg-white/10 border-white/15"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5"
        >
          {tab === "departments" && (
            <MasterEntityPanel
              title="Departments"
              subtitle="E.g., Institute / Department like CSE, ECE, Design, Management."
              endpoint="/api/master/departments"
              fields={[
                { key: "name", label: "Department Name", type: "text", placeholder: "Computer Science" },
                { key: "code", label: "Code", type: "text", placeholder: "CSE" },
              ]}
              listLabelKey="name"
              listSecondaryKey="code"
            />
          )}

          {tab === "programs" && (
            <MasterEntityPanel
              title="Programs"
              subtitle="Programs belong to a department (e.g., B.Tech CSE, B.Des)."
              endpoint="/api/master/programs"
              fields={[
                { key: "name", label: "Program Name", type: "text", placeholder: "B.Tech Computer Science" },
                { key: "code", label: "Code", type: "text", placeholder: "BTCS" },
                { key: "departmentId", label: "Department", type: "select", options: deptOptions, placeholder: "Select department" },
              ]}
              listLabelKey="name"
              listSecondaryKey="code"
            />
          )}

          {tab === "courses" && (
            <MasterEntityPanel
              title="Courses"
              subtitle="Courses belong to a program (course → semesters)."
              endpoint="/api/master/courses"
              fields={[
                { key: "name", label: "Course Name", type: "text", placeholder: "B.Tech CSE" },
                { key: "code", label: "Code", type: "text", placeholder: "BTECH-CSE" },
                { key: "programId", label: "Program", type: "select", options: programOptions, placeholder: "Select program" },
              ]}
              listLabelKey="name"
              listSecondaryKey="code"
            />
          )}

          {tab === "subjects" && (
            <MasterEntityPanel
              title="Subjects"
              subtitle="Subjects live under a department (later we’ll map to semesters/sections)."
              endpoint="/api/master/subjects"
              fields={[
                { key: "name", label: "Subject Name", type: "text", placeholder: "Data Structures" },
                { key: "code", label: "Code", type: "text", placeholder: "DS" },
                { key: "credits", label: "Credits", type: "number", placeholder: "4" },
                { key: "departmentId", label: "Department", type: "select", options: deptOptions, placeholder: "Select department" },
              ]}
              listLabelKey="name"
              listSecondaryKey="code"
            />
          )}

          {tab === "semesters" && (
            <MasterEntityPanel
              title="Semesters"
              subtitle="Semester number belongs to a course (e.g., Course BTECH-CSE → Semester 1)."
              endpoint="/api/master/semesters"
              fields={[
                { key: "number", label: "Semester Number", type: "number", placeholder: "1" },
                { key: "courseId", label: "Course", type: "select", options: courseOptions, placeholder: "Select course" },
              ]}
              listLabelKey="id"
              listSecondaryKey="number"
            />
          )}

          {tab === "sections" && (
            <MasterEntityPanel
              title="Sections"
              subtitle="Sections map: Department + Semester + Batch + Section name (A/B)."
              endpoint="/api/master/sections"
              fields={[
                { key: "name", label: "Section Name", type: "text", placeholder: "A" },
                { key: "batchYear", label: "Batch Year", type: "number", placeholder: "2025" },
                { key: "departmentId", label: "Department", type: "select", options: deptOptions, placeholder: "Select department" },
                // semesters are fetched via API; we use course options here and keep it simple,
                // but if you want, we can fetch semesters list and show it properly (recommended next).
                { key: "semesterId", label: "Semester ID", type: "text", placeholder: "Paste Semester ID (next: dropdown)" },
              ]}
              listLabelKey="name"
              listSecondaryKey="batchYear"
            />
          )}
        </motion.div>

        <div className="mt-6 text-xs text-slate-300">
          Note: JKLU campus location micro-copy is based on official contact info.
        </div>
      </AdminShell>
    </Protected>
  );
}
