'use client'

import { useEffect, useRef, useState } from 'react'

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Stars() {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: seededRandom(i * 3) * 100,
    y: seededRandom(i * 3 + 1) * 100,
    size: seededRandom(i * 3 + 2) * 1.8 + 0.4,
    delay: seededRandom(i * 7) * 5,
    dur: seededRandom(i * 7 + 1) * 3 + 2,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%', background: 'white',
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-15%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite', animationDelay: '-3s' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', animation: 'float 12s ease-in-out infinite', animationDelay: '-6s' }} />
    </div>
  )
}

function IntroAnimation() {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 3000)
    const removeTimer = setTimeout(() => setVisible(false), 4000)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#03040A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 1s ease',
      pointerEvents: fadeOut ? 'none' : 'all',
    }}>
      <video autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
        <source src="/intro.mp4" type="video/mp4" />
      </video>
    </div>
  )
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const glass = { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)' } as const
  const links = ['Features', 'Roles', 'AI', 'Tech Stack']
  const LOGIN_URL = 'http://localhost:3001/login'
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all 0.4s ease', ...(scrolled ? { ...glass, padding: '12px 0' } : { padding: '24px 0' }) }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 36, height: 36 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 10, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6, #06B6D4)' }} />
            <div style={{ position: 'absolute', inset: 2, borderRadius: 8, background: '#03040A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>U</span>
            </div>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'white' }}>
            Uni<span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Verse</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: 32 }} className="hide-mobile">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(' ', '-')}`}
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)' }}>
              {l}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }} className="hide-mobile">
          <a href={LOGIN_URL} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer', padding: '8px 16px', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)' }}>
            Sign In
          </a>
          <a href={LOGIN_URL} style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
            Get Started →
          </a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="show-mobile">
          <div style={{ width: 22, height: 2, background: 'rgba(255,255,255,0.7)', marginBottom: 5, borderRadius: 2, transition: 'all 0.3s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: 'rgba(255,255,255,0.7)', marginBottom: 5, borderRadius: 2, opacity: open ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 2, transition: 'all 0.3s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ ...glass, margin: '8px 16px', borderRadius: 16, padding: 16 }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
              style={{ display: 'block', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '10px 8px', fontSize: 14 }}>
              {l}
            </a>
          ))}
          <a href={LOGIN_URL} style={{ display: 'block', width: '100%', marginTop: 8, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', textAlign: 'center' }}>
            Get Started →
          </a>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])
  const fadeUp = (delay: number) => ({ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` })
  const LOGIN_URL = 'http://localhost:3001/login'
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.07) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
        {[220, 340, 460].map((r, i) => <div key={i} style={{ position: 'absolute', width: r * 2, height: r * 2, top: -r, left: -r, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)' }} />)}
        <div style={{ position: 'absolute', top: 0, left: 0, animation: 'orbit1 8s linear infinite' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4F8EF7', boxShadow: '0 0 12px #4F8EF7', transform: 'translate(-5px,-5px)' }} /></div>
        <div style={{ position: 'absolute', top: 0, left: 0, animation: 'orbit2 12s linear infinite' }}><div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 10px #8B5CF6', transform: 'translate(-3.5px,-3.5px)' }} /></div>
        <div style={{ position: 'absolute', top: 0, left: 0, animation: 'orbit3 16s linear infinite' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 10px #06B6D4', transform: 'translate(-4px,-4px)' }} /></div>
      </div>

      <div style={{ ...fadeUp(100), display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28, background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 100, padding: '7px 16px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#06B6D4', animation: 'pulse 2s ease-in-out infinite' }} />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI-Powered Academic Platform</span>
      </div>

      <div style={fadeUp(200)}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(48px, 9vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'white', marginBottom: 20 }}>
          The Universe of<br />
          <span style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 50%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Academic</span><br />
          Intelligence
        </h1>
      </div>

      <div style={fadeUp(300)}>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.42)', maxWidth: 560, lineHeight: 1.7, margin: '0 auto 40px' }}>
          UniVerse unifies student records, faculty management, attendance, assessments, and AI-powered insights — all in one secure, role-based platform.
        </p>
      </div>

      {/* Single CTA — no demo button */}
      <div style={{ ...fadeUp(400), display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
        <a href={LOGIN_URL} style={{
          background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6, #06B6D4)',
          color: 'white', border: 'none', borderRadius: 16, padding: '16px 40px',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 0 40px rgba(79,142,247,0.35)',
          textDecoration: 'none', display: 'inline-block',
          transition: 'box-shadow 0.3s, transform 0.3s',
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = '0 0 60px rgba(79,142,247,0.55)'; el.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = '0 0 40px rgba(79,142,247,0.35)'; el.style.transform = 'translateY(0)' }}>
          Get Started →
        </a>
      </div>

      <div style={{ ...fadeUp(500), display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ val: '10K+', label: 'Students Managed' }, { val: '99.9%', label: 'Uptime SLA' }, { val: '4', label: 'User Roles' }, { val: '<2s', label: 'Avg Response' }].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DashboardPreview() {
  const { ref, inView } = useInView()
  return (
    <section style={{ padding: '80px 24px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(48px)', transition: 'all 0.9s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(79,142,247,0.7)', display: 'block', marginBottom: 12 }}>Platform Preview</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,52px)', color: 'white', margin: 0 }}>
            Your campus, <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>unified</span>
          </h2>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 0 80px rgba(79,142,247,0.08), 0 40px 80px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(234,179,8,0.6)' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(34,197,94,0.6)' }} />
            <div style={{ marginLeft: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, height: 26, maxWidth: 280, flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>universe.edu/dashboard</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: 440 }} className="dash-grid">
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', padding: 16, background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)' }} />
                <div style={{ height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, width: 60 }} />
              </div>
              {['Home', 'Attendance', 'Marks', 'Timetable', 'Notices', 'AI Chat'].map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, marginBottom: 2, background: i === 0 ? 'rgba(79,142,247,0.12)' : 'transparent' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#4F8EF7' : 'rgba(255,255,255,0.15)' }} />
                  <span style={{ fontSize: 12, color: i === 0 ? '#4F8EF7' : 'rgba(255,255,255,0.3)' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <div style={{ height: 18, background: 'rgba(255,255,255,0.18)', borderRadius: 6, width: 160, marginBottom: 8 }} />
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.07)', borderRadius: 4, width: 100 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }} />)}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[{ label: 'Attendance', val: '87%', prog: 87, color: '#4F8EF7' }, { label: 'CGPA', val: '8.4', prog: 84, color: '#8B5CF6' }, { label: 'Assignments', val: '12/14', prog: 86, color: '#F59E0B' }].map(card => (
                  <div key={card.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 14 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{card.label}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, background: `linear-gradient(135deg, ${card.color}, #8B5CF6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 10 }}>{card.val}</div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: inView ? `${card.prog}%` : '0%', background: `linear-gradient(90deg, ${card.color}, #8B5CF6)`, borderRadius: 2, transition: 'width 1.2s ease 0.3s' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Recent Activity</div>
                {[{ dot: '#06B6D4', text: 'Attendance marked for CS401', time: '2m ago' }, { dot: '#8B5CF6', text: 'Quiz result published — 92/100', time: '1h ago' }, { dot: '#4F8EF7', text: 'Timetable updated for Sem 6', time: '3h ago' }, { dot: '#F59E0B', text: 'New notice: Mid-term schedule', time: '1d ago' }].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const { ref, inView } = useInView()
  const features = [
    { icon: '🎓', title: 'Student Information System', desc: 'Complete academic profiles, enrollment records, semester mapping, and status tracking in one unified view.', accent: '#4F8EF7' },
    { icon: '📊', title: 'Attendance Management', desc: 'Subject-wise tracking, auto percentage calculation, shortage detection, and real-time defaulter reports.', accent: '#8B5CF6' },
    { icon: '📝', title: 'Assessment & Grading', desc: 'Quizzes, assignments, midterms — weighted marks with auto-totals and configurable grade visibility.', accent: '#06B6D4' },
    { icon: '🤖', title: 'AI Academic Assistant', desc: 'Natural language queries on academic data. Summarize attendance, explain trends, generate reports instantly.', accent: '#F59E0B', featured: true },
    { icon: '📅', title: 'Timetable Management', desc: 'Smart class scheduling with conflict detection, faculty scheduling, and room allocation logic.', accent: '#F43F5E' },
    { icon: '🔔', title: 'Notices & Announcements', desc: 'Department-specific notices with file attachments and role-based visibility controls.', accent: '#4F8EF7' },
  ]
  return (
    <section id="features" style={{ padding: '100px 24px' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s ease' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(139,92,246,0.7)', display: 'block', marginBottom: 12 }}>Core Modules</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,56px)', color: 'white', margin: '0 0 16px' }}>
            Everything your institution{' '}
            <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>needs</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.38)', maxWidth: 480, margin: '0 auto' }}>10 integrated modules covering the full academic lifecycle.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden', cursor: 'pointer', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(48px)', transition: `opacity 0.7s ease ${i * 80}ms, transform 0.7s ease ${i * 80}ms, background 0.3s, border-color 0.3s` }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(79,142,247,0.06)'; el.style.borderColor = `${f.accent}35`; el.style.transform = 'translateY(-6px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)' }}>
              {(f as any).featured && <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', color: 'white', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 100, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI-Powered</div>}
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: 'white', margin: '0 0 10px' }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Learn more →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Roles() {
  const { ref, inView } = useInView()
  const [active, setActive] = useState(0)
  const roles = [
    { name: 'Student', icon: '👤', permissions: ['View academic profile & history', 'Track attendance per subject', 'View marks & CGPA', 'Access personal timetable', 'Read department notices', 'AI assistant (own data only)'], desc: 'Students get a personal academic hub with full visibility into their own performance.', scope: 25, control: 5, ai: 30 },
    { name: 'Faculty', icon: '👨‍🏫', permissions: ['Mark & manage attendance', 'Enter internal marks', 'View assigned courses', 'Faculty-specific timetable', 'Post course notices', 'AI assistant (assigned subjects)'], desc: 'Faculty manage courses end-to-end — from marking attendance to submitting grades.', scope: 50, control: 20, ai: 50 },
    { name: 'HOD', icon: '🏛️', permissions: ['View department analytics', 'Monitor faculty workload', 'Review student performance', 'Approve academic configs', 'Department-wide reports', 'Cross-subject AI insights'], desc: 'Heads of Department get a birds-eye view of academic health across faculty and students.', scope: 75, control: 40, ai: 80 },
    { name: 'Admin', icon: '⚙️', permissions: ['Full user management', 'Create departments & courses', 'Configure semesters', 'System settings control', 'Login activity logs', 'Full platform oversight'], desc: 'Administrators control the entire platform — from user creation to system-wide configuration.', scope: 100, control: 100, ai: 100 },
  ]
  const r = roles[active]
  return (
    <section id="roles" style={{ padding: '100px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s ease' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(6,182,212,0.7)', display: 'block', marginBottom: 12 }}>Role-Based Access</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,56px)', color: 'white', margin: '0 0 14px' }}>
            The right access,{' '}
            <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>for everyone</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.38)', maxWidth: 480, margin: '0 auto' }}>Strict RBAC ensures every user sees exactly what they need.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap', opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.2s' }}>
          {roles.map((role, i) => (
            <button key={role.name} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 16, fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s', background: active === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: active === i ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)', color: active === i ? 'white' : 'rgba(255,255,255,0.45)' }}>
              <span>{role.icon}</span><span>{role.name}</span>
            </button>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 28, overflow: 'hidden', opacity: inView ? 1 : 0, transition: 'opacity 0.7s ease 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="roles-grid">
            <div style={{ padding: 36, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
                <span style={{ fontSize: 36 }}>{r.icon}</span>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'white', margin: '0 0 2px' }}>{r.name}</h3>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{r.permissions.length} permissions granted</p>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {r.permissions.map(p => (
                  <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#4F8EF7', fontSize: 10 }}>✓</span>
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, marginBottom: 36 }}>{r.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[{ label: 'Data Scope', val: r.scope }, { label: 'System Control', val: r.control }, { label: 'AI Access Level', val: r.ai }].map(item => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                      <span>{item.label}</span><span>{item.val}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.val}%`, background: 'linear-gradient(90deg, #4F8EF7, #8B5CF6)', borderRadius: 3, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AISection() {
  const { ref, inView } = useInView()
  const [typed, setTyped] = useState('')
  const [response, setResponse] = useState('')
  const [phase, setPhase] = useState<'idle' | 'typing' | 'responding' | 'done'>('idle')
  const query = "What's my attendance summary this semester?"
  const answer = "You have 87% attendance overall. CS401: 91%, DS301: 84%, MATH401: 86%. You are at risk of shortage in DS301 — 2 more absences will trigger the defaulter list."
  useEffect(() => {
    if (!inView || phase !== 'idle') return
    const t0 = setTimeout(() => {
      setPhase('typing'); let i = 0
      const t1 = setInterval(() => {
        i++; setTyped(query.slice(0, i))
        if (i >= query.length) {
          clearInterval(t1)
          setTimeout(() => {
            setPhase('responding'); let j = 0
            const t2 = setInterval(() => { j += 3; setResponse(answer.slice(0, j)); if (j >= answer.length) { clearInterval(t2); setPhase('done') } }, 18)
          }, 700)
        }
      }, 42)
    }, 1000)
    return () => clearTimeout(t0)
  }, [inView, phase])
  return (
    <section id="ai" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="ai-grid">
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-40px)', transition: 'all 0.8s ease' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,158,11,0.7)', display: 'block', marginBottom: 16 }}>AI Academic Assistant</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', color: 'white', margin: '0 0 20px', lineHeight: 1.1 }}>
            Ask anything,<br />
            <span style={{ background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>get answers instantly</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, marginBottom: 32 }}>Our AI assistant understands academic context. Ask about attendance, grades, trends, or reports in plain English. Strict backend-controlled access ensures privacy.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[{ q: '"Show my CGPA trend this year"', icon: '📈' }, { q: '"Which subjects need more attention?"', icon: '🎯' }, { q: '"Generate my semester report"', icon: '📄' }].map(item => (
              <div key={item.q} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,158,11,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)' }}>
                <span>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{item.q}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(40px)', transition: 'all 0.8s ease 0.2s' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, overflow: 'hidden', boxShadow: '0 0 80px rgba(245,158,11,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ position: 'relative', width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: '#22C55E', border: '2px solid #070A14' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'white' }}>UniVerse AI</div>
                <div style={{ fontSize: 11, color: '#22C55E' }}>Online · Secured session</div>
              </div>
            </div>
            <div style={{ padding: 20, minHeight: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center' }}><span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: 100 }}>Your data only · Backend-controlled</span></div>
              {typed && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: '18px 18px 4px 18px', background: 'linear-gradient(135deg, rgba(79,142,247,0.25), rgba(139,92,246,0.25))', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.6 }}>{typed}{phase === 'typing' ? <span style={{ animation: 'blink 1s step-end infinite' }}>|</span> : ''}</p>
                  </div>
                </div>
              )}
              {phase !== 'idle' && phase !== 'typing' && response && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginTop: 2 }}>🤖</div>
                  <div>
                    <div style={{ padding: '12px 16px', borderRadius: '4px 18px 18px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', margin: 0, lineHeight: 1.7 }}>{response}{phase === 'responding' ? <span style={{ animation: 'blink 1s step-end infinite' }}>|</span> : ''}</p>
                    </div>
                    {phase === 'done' && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        {['📋 Copy', '📊 Chart', '📄 PDF'].map(a => <button key={a} style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}>{a}</button>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '10px 14px' }}>
                <input readOnly placeholder="Ask about your academics..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                <button style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #F59E0B, #F43F5E)', border: 'none', color: 'white', fontSize: 14, cursor: 'pointer' }}>→</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TechStack() {
  const { ref, inView } = useInView()
  const techs = ['Next.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Prisma ORM', 'JWT Auth', 'OpenAI API', 'Tailwind CSS', 'Express.js', 'bcrypt', 'Vercel', 'Supabase']
  return (
    <section id="tech-stack" style={{ padding: '80px 0', overflow: 'hidden' }}>
      <div ref={ref} style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 24px' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 10 }}>Built With</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(26px,4vw,40px)', color: 'white', margin: 0 }}>
            Modern tech, <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>enterprise grade</span>
          </h2>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(90deg, #03040A, transparent)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, background: 'linear-gradient(-90deg, #03040A, transparent)', zIndex: 1, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 14, animation: 'marquee 22s linear infinite', willChange: 'transform' }}>
              {[...techs, ...techs, ...techs].map((t, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '12px 24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Architecture() {
  const { ref, inView } = useInView()
  const layers = [
    { label: 'Frontend', sub: 'Next.js · Tailwind CSS · TypeScript', icon: '🖥️' },
    { label: 'API Layer', sub: 'Node.js · Express.js · REST APIs', icon: '⚡' },
    { label: 'Auth & RBAC', sub: 'JWT · bcrypt · Middleware Guards', icon: '🔐' },
    { label: 'Database', sub: 'PostgreSQL · Prisma ORM · Indexed', icon: '🗄️' },
    { label: 'AI Integration', sub: 'OpenAI / Gemini · Backend-controlled only', icon: '🤖' },
  ]
  return (
    <section style={{ padding: '100px 24px' }}>
      <div ref={ref} style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s ease' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,63,94,0.7)', display: 'block', marginBottom: 12 }}>System Design</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,52px)', color: 'white', margin: '0 0 12px' }}>
            Secure <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>by design</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.38)', margin: 0 }}>No direct AI access to your database — ever.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 23, top: 24, bottom: 24, width: 1, background: 'linear-gradient(to bottom, #4F8EF7, #8B5CF6, #F43F5E)', opacity: inView ? 0.4 : 0, transition: 'opacity 1.2s ease' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {layers.map((layer, i) => (
              <div key={layer.label} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-32px)', transition: `all 0.6s ease ${i * 120}ms` }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, position: 'relative', zIndex: 1 }}>{layer.icon}</div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'white', marginBottom: 3 }}>{layer.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{layer.sub}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s ease-in-out infinite', flexShrink: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const { ref, inView } = useInView()
  const cases = [
    { role: 'Student', name: 'Arjun Sharma', avatar: 'AS', color: 'linear-gradient(135deg, #4F8EF7, #06B6D4)', quote: 'I can check attendance, marks, and ask the AI about my performance — all in one place. It genuinely feels like magic.' },
    { role: 'Faculty', name: 'Dr. Priya Nair', avatar: 'PN', color: 'linear-gradient(135deg, #8B5CF6, #4F8EF7)', quote: 'Marking attendance used to take 15 minutes. Now it takes 30 seconds. The auto-calculations have eliminated all manual errors.' },
    { role: 'Administrator', name: 'Rajesh Kumar', avatar: 'RK', color: 'linear-gradient(135deg, #F59E0B, #F43F5E)', quote: 'Setting up a new semester used to take days of emails. With UniVerse, I configure everything in under 10 minutes.' },
  ]
  return (
    <section style={{ padding: '100px 24px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s ease' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,52px)', color: 'white', margin: 0 }}>
            Real users, <span style={{ background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>real impact</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {cases.map((c, i) => (
            <div key={c.name} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 28, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(48px)', transition: `all 0.7s ease ${i * 100}ms` }}>
              <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)', marginBottom: 16, fontFamily: 'serif' }}>"</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, marginBottom: 24 }}>{c.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{c.avatar}</div>
                <div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'white' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{c.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  const { ref, inView } = useInView()
  const LOGIN_URL = 'http://localhost:3001/login'
  return (
    <section style={{ padding: '80px 24px 120px' }}>
      <div ref={ref} style={{ maxWidth: 860, margin: '0 auto', opacity: inView ? 1 : 0, transform: inView ? 'scale(1)' : 'scale(0.95)', transition: 'all 0.8s ease' }}>
        <div style={{ position: 'relative', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(40px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 32, padding: '72px 48px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,142,247,0.06), rgba(139,92,246,0.06), rgba(6,182,212,0.04))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 200, background: 'radial-gradient(ellipse, rgba(79,142,247,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 100, padding: '7px 16px', marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Now Available</span>
            </div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px,5vw,58px)', color: 'white', margin: '0 0 16px', lineHeight: 1.05 }}>
              Ready to launch<br />
              <span style={{ background: 'linear-gradient(135deg, #4F8EF7 0%, #8B5CF6 50%, #06B6D4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>your universe?</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.42)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Join institutions modernizing academic management with UniVerse. Deploy in days, not months.
            </p>
            <a href={LOGIN_URL} style={{
              display: 'inline-block', background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6)',
              color: 'white', border: 'none', borderRadius: 16, padding: '18px 48px',
              fontSize: 16, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
              boxShadow: '0 0 40px rgba(79,142,247,0.35)', transition: 'box-shadow 0.3s, transform 0.3s',
            }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = '0 0 60px rgba(79,142,247,0.55)'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.boxShadow = '0 0 40px rgba(79,142,247,0.35)'; el.style.transform = 'translateY(0)' }}>
              Get Started →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const LOGIN_URL = 'http://localhost:3001/login'
  return (
    <footer style={{ padding: '32px 24px 48px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 32, height: 32 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 9, background: 'linear-gradient(135deg, #4F8EF7, #8B5CF6, #06B6D4)' }} />
            <div style={{ position: 'absolute', inset: 2, borderRadius: 7, background: '#03040A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 12, fontFamily: 'Syne, sans-serif' }}>U</span>
            </div>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>UniVerse</span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginLeft: 8 }}>AI Academic Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['Privacy', 'Terms', 'Docs'].map(l => <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>{l}</a>)}
          <a href={LOGIN_URL} style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>Sign In</a>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', margin: 0 }}>© 2025 UniVerse. Built for modern institutions.</p>
      </div>
    </footer>
  )
}

export default function Home() {
  return (
    <>
      <IntroAnimation />
      <Stars />
      <FloatingOrbs />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <DashboardPreview />
        <Features />
        <Roles />
        <AISection />
        <TechStack />
        <Architecture />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  )
}