import Reveal from "@/components/Reveal";
import MagneticButton from "@/components/MagneticButton";

export default function CTA() {
  return (
    <section id="cta" className="relative z-[2] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div className="card rounded-[2.25rem] p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(900px 400px at 20% 20%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(900px 400px at 80% 40%, rgba(236,72,153,0.25), transparent 60%)",
              }}
            />
            <div className="relative">
              <h3 className="text-2xl md:text-4xl font-semibold tracking-tight">
                Make academic operations feel effortless.
              </h3>
              <p className="mt-3 text-muted max-w-2xl">
                A clean platform your students and faculty will actually enjoy using — with RBAC-grade security and AI-assisted insights.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <MagneticButton className="bg-white text-black hover:bg-white/90 px-6 py-3">
                  Request Demo
                </MagneticButton>
                <MagneticButton className="glass hover:bg-white/10 px-6 py-3">
                  Talk to Us
                </MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
