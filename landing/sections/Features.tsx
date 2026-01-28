import Reveal from "@/components/Reveal";
import { Shield, Calendar, ClipboardList, GraduationCap, Bell, BarChart3 } from "lucide-react";

const items = [
  { icon: ClipboardList, title: "Attendance", desc: "Session-wise marking, auto %, defaulter detection, role-based visibility." },
  { icon: GraduationCap, title: "Internal Marks", desc: "Configurable assessments, validations, auto totals, publish control." },
  { icon: Calendar, title: "Timetables", desc: "Room + faculty scheduling with conflict detection and clean approvals." },
  { icon: Bell, title: "Notices", desc: "Targeted announcements by department, role and semester with attachments." },
  { icon: BarChart3, title: "Reports", desc: "Subject/semester analytics, downloadable PDF-style reports and dashboards." },
  { icon: Shield, title: "RBAC-first", desc: "Strict filtering by role, department, section and semester before any data leaves backend." },
];

export default function Features() {
  return (
    <section id="features" className="relative z-2 pt-20 md:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
            Everything essential. Nothing bloated.
          </h2>
          <p className="mt-3 text-muted max-w-2xl">
            UniVerse covers core academic workflows in a clean, scalable system designed for real institutions.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.03}>
              <div className="card rounded-3xl p-6 hover:bg-white/10 transition">
                <it.icon className="h-5 w-5 text-white/80" />
                <div className="mt-4 text-base font-semibold">{it.title}</div>
                <div className="mt-2 text-sm text-muted leading-relaxed">{it.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
