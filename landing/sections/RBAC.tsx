import Reveal from "@/components/Reveal";

const roles = [
  ["Student", "Attendance, marks, timetable, results, notices — only personal scoped views."],
  ["Faculty", "Mark attendance, assessments, internal marks. Class-level analytics."],
  ["HOD", "Department-level monitoring. Faculty + student performance overview."],
  ["Admin", "Full access, configuration, user + mapping, reporting, audit trails."],
];

export default function RBAC() {
  return (
    <section id="security" className="relative z-[2] pt-20 md:pt-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">
            Security is the product.
          </h2>
          <p className="mt-3 text-muted max-w-2xl">
            UniVerse enforces role, department, and semester scoping before any data is returned — and before AI ever sees anything.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(([r, d], i) => (
            <Reveal key={r} delay={i * 0.05}>
              <div className="card rounded-3xl p-6">
                <div className="text-sm font-semibold">{r}</div>
                <div className="mt-2 text-sm text-muted leading-relaxed">{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
