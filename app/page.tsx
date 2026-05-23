'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, Check, Calendar, Users,
  Network, FileText, Zap, GitBranch, ChevronRight,
  Shield, BarChart3, Cpu, Globe,
} from 'lucide-react';

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Animated workflow demo ─── */
const WORKFLOW_STEPS = [
  { id: 'gantt',  label: 'Gantt Chart',       icon: Calendar,  color: '#38BDF8' },
  { id: 'raci',   label: 'RACI Matrix',        icon: Users,     color: '#22C55E' },
  { id: 'bpmn',   label: 'Process Flow',       icon: GitBranch, color: '#A78BFA' },
  { id: 'arch',   label: 'Architecture',       icon: Network,   color: '#FB923C' },
  { id: 'sow',    label: 'Proposal / SOW',     icon: FileText,  color: '#F472B6' },
];

function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(-1);
  const [typed, setTyped]   = useState('');
  const [done, setDone]     = useState(false);
  const prompt = 'Build a fintech reconciliation platform for enterprise clients';
  const { ref, visible } = useReveal();

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const typeTimer = setInterval(() => {
      setTyped(prompt.slice(0, i + 1));
      i++;
      if (i >= prompt.length) {
        clearInterval(typeTimer);
        let step = 0;
        const stepTimer = setInterval(() => {
          setActiveStep(step);
          step++;
          if (step >= WORKFLOW_STEPS.length) {
            clearInterval(stepTimer);
            setDone(true);
          }
        }, 600);
      }
    }, 28);
    return () => clearInterval(typeTimer);
  }, [visible]);

  return (
    <div ref={ref} className="max-w-4xl mx-auto">
      {/* Prompt */}
      <div
        className="rounded-xl p-5 mb-6 font-mono text-sm"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/70" />
          <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>AI Prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent-hover)' }}>›</span>
          <span style={{ color: 'var(--text-secondary)' }}>{typed}</span>
          <span
            className="inline-block w-0.5 h-4 ml-0.5"
            style={{
              background: 'var(--accent-hover)',
              animation: typed.length < prompt.length ? 'none' : 'blink 1s step-end infinite',
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-5 gap-3">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep >= idx;
          return (
            <div
              key={step.id}
              className="rounded-xl p-4 text-center transition-all duration-500"
              style={{
                background: isActive
                  ? `rgba(${step.id === 'gantt' ? '56,189,248' : step.id === 'raci' ? '34,197,94' : step.id === 'bpmn' ? '167,139,250' : step.id === 'arch' ? '251,146,60' : '244,114,182'},0.10)`
                  : 'var(--surface-1)',
                border: `1px solid ${isActive ? step.color + '30' : 'var(--border)'}`,
                opacity: isActive ? 1 : 0.4,
                transform: isActive ? 'translateY(0)' : 'translateY(4px)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{ background: isActive ? step.color + '20' : 'var(--surface-2)' }}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? step.color : 'var(--text-muted)' }} />
              </div>
              <p className="text-xs font-medium" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {step.label}
              </p>
              {isActive && (
                <div className="mt-2 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
                  <span className="text-[10px]" style={{ color: step.color }}>Generated</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div
          className="mt-4 rounded-lg px-4 py-3 flex items-center gap-3 text-sm"
          style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.20)',
          }}
        >
          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
          <span style={{ color: '#22C55E' }}>
            5 project artifacts generated in 4.2 seconds — ready to export
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Hero App Preview ─── */
function AppPreview() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid var(--divider)', background: 'var(--surface-2)' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]/60" />
        <div
          className="ml-3 flex-1 rounded-md px-3 py-1 text-xs"
          style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
        >
          Q3 Product Launch — Gantt Chart
        </div>
        <div
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#8B5CF6', border: '1px solid rgba(124,58,237,0.25)' }}
        >
          AI
        </div>
      </div>

      {/* Gantt mockup */}
      <div className="p-4">
        {/* Month headers */}
        <div className="flex gap-1 mb-3 pl-28">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
            <div key={m} className="flex-1 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>{m}</div>
          ))}
        </div>

        {/* Gantt rows */}
        {[
          { label: 'Discovery',    bar: [0, 1.5],  color: '#7C3AED' },
          { label: 'Design',       bar: [1, 2.5],  color: '#38BDF8' },
          { label: 'Development',  bar: [2.5, 5],  color: '#8B5CF6' },
          { label: 'QA Testing',   bar: [4.5, 5.5],color: '#22C55E' },
          { label: 'Launch',       bar: [5.5, 6],  color: '#F59E0B' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 mb-2">
            <div className="w-24 text-[11px] truncate flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </div>
            <div className="flex-1 relative h-5 rounded" style={{ background: 'var(--surface-3)' }}>
              {/* grid lines */}
              {[1,2,3,4,5].map(i => (
                <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${(i/6)*100}%`, background: 'var(--divider)' }} />
              ))}
              <div
                className="absolute top-0.5 bottom-0.5 rounded"
                style={{
                  left: `${(row.bar[0]/6)*100}%`,
                  width: `${((row.bar[1]-row.bar[0])/6)*100}%`,
                  background: row.color,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        ))}

        {/* RACI snippet */}
        <div
          className="mt-4 rounded-lg p-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>RACI Matrix</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {['Task', 'PM', 'Dev', 'Design', 'QA'].map((h, i) => (
              <div key={h} className="text-[9px] text-center font-medium py-0.5 rounded"
                style={{ background: i === 0 ? 'transparent' : 'var(--surface-3)', color: 'var(--text-muted)' }}>
                {h}
              </div>
            ))}
            {['Requirements', 'R', 'C', 'I', 'I'].map((c, i) => (
              <div key={i} className="text-[9px] text-center py-0.5 rounded"
                style={{
                  color: c === 'R' ? '#7C3AED' : c === 'A' ? '#22C55E' : c === 'C' ? '#38BDF8' : 'var(--text-muted)',
                  background: i === 0 ? 'transparent' : 'var(--surface-3)',
                  fontWeight: c === 'R' ? 700 : 400,
                }}>
                {c}
              </div>
            ))}
            {['Architecture', 'A', 'R', 'C', 'I'].map((c, i) => (
              <div key={i} className="text-[9px] text-center py-0.5 rounded"
                style={{
                  color: c === 'R' ? '#7C3AED' : c === 'A' ? '#22C55E' : c === 'C' ? '#38BDF8' : 'var(--text-muted)',
                  background: i === 0 ? 'transparent' : 'var(--surface-3)',
                  fontWeight: ['R','A'].includes(c) ? 700 : 400,
                }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,13,16,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ProjectFlow <span style={{ color: 'var(--accent-hover)' }}>AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Workflow', 'Pricing'].map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-sm transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm transition-colors duration-150 hidden md:block"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Sign in
            </Link>
            <Link
              href="/sign-in?redirect_url=/pricing"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all duration-200"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 16px rgba(124,58,237,0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(124,58,237,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(124,58,237,0.3)';
              }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative pt-32 pb-24 px-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.12), transparent),
            var(--bg-base)
          `,
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)',
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              {/* Pill badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                style={{
                  background: 'var(--accent-soft-bg)',
                  border: '1px solid var(--accent-soft-bd)',
                  color: 'var(--accent-hover)',
                }}
              >
                <Sparkles className="w-3 h-3" />
                AI-powered project planning workspace
              </div>

              <h1
                className="text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight mb-6"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
              >
                Plan projects.
                <br />
                <span style={{ color: 'var(--accent-hover)' }}>Ship faster.</span>
                <br />
                Zero friction.
              </h1>

              <p className="text-base mb-8 leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Describe your project in plain language. ProjectFlow AI generates Gantt charts, RACI matrices, process flows, architecture diagrams, and full SOW proposals — instantly.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 mb-10">
                <Link
                  href="/sign-in?redirect_url=/pricing"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.35)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(124,58,237,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(124,58,237,0.35)';
                  }}
                >
                  Start free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#workflow"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  See how it works
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                {[
                  { icon: Check, label: 'No credit card required' },
                  { icon: Zap, label: 'Generate in seconds' },
                  { icon: Shield, label: 'SOC 2 compliant' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--accent-hover)' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — App Preview */}
            <div
              style={{
                animation: 'slideInRight 0.8s ease forwards',
                opacity: 0,
              }}
            >
              <AppPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '12,000+', label: 'Projects Generated' },
              { value: '850+',    label: 'Teams Active' },
              { value: '4.2s',    label: 'Avg. Generation Time' },
              { value: '40hrs',   label: 'Saved Per Project' },
            ].map(({ value, label }) => (
              <Reveal key={label}>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI WORKFLOW DEMO ── */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-5"
                style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)', color: 'var(--accent-hover)' }}
              >
                <Cpu className="w-3 h-3" />
                AI Workflow Engine
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                One prompt.<br />Five artifacts.
              </h2>
              <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Describe your project in plain language. The AI builds every planning artifact simultaneously — no templates, no manual work.
              </p>
            </div>
          </Reveal>
          <WorkflowDemo />
        </div>
      </section>

      {/* ── BENTO FEATURE GRID ── */}
      <section id="features" className="py-24 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Every tool a PM needs.
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                From kickoff to delivery. No other tool required.
              </p>
            </div>
          </Reveal>

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Large card - AI Generation */}
            <Reveal delay={0}>
              <div
                className="md:col-span-2 rounded-2xl p-7 h-full min-h-[240px] relative overflow-hidden group transition-all duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-soft-bd)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)', transform: 'translate(30%, -30%)' }} />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)' }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>AI Generation Engine</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                  Paste a brief project description and receive a complete planning suite — Gantt, RACI, BPMN, architecture diagram, and SOW — in under 5 seconds.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Gantt', 'RACI', 'BPMN', 'Architecture', 'SOW'].map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full text-xs"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Small card - Export */}
            <Reveal delay={100}>
              <div
                className="rounded-2xl p-7 min-h-[240px] transition-all duration-200 group"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}
                >
                  <BarChart3 className="w-4 h-4" style={{ color: '#22C55E' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Export Anywhere</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Export to PDF, Word, PNG, or SVG. Send polished deliverables to clients without formatting work.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Gantt */}
            <Reveal delay={0}>
              <div
                className="rounded-2xl p-7 min-h-[220px] transition-all duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(56,189,248,0.20)' }}
                >
                  <Calendar className="w-4 h-4" style={{ color: '#38BDF8' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Gantt Charts</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Interactive timelines with drag-and-drop phases, milestones, and multi-month breakdown.
                </p>
              </div>
            </Reveal>

            {/* RACI */}
            <Reveal delay={80}>
              <div
                className="rounded-2xl p-7 min-h-[220px] transition-all duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.20)' }}
                >
                  <Users className="w-4 h-4" style={{ color: '#A78BFA' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>RACI Matrix</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Define clear ownership across stakeholders with dual-mark support and Word export.
                </p>
              </div>
            </Reveal>

            {/* BPMN */}
            <Reveal delay={160}>
              <div
                className="rounded-2xl p-7 min-h-[220px] transition-all duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,146,60,0.25)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(251,146,60,0.10)', border: '1px solid rgba(251,146,60,0.20)' }}
                >
                  <GitBranch className="w-4 h-4" style={{ color: '#FB923C' }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Process Flows</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Full BPMN 2.0 editor with swimlanes, gateways, events, and sequence flows.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Row 3 — wide architecture card */}
          <Reveal delay={0}>
            <div
              className="rounded-2xl p-8 grid md:grid-cols-2 gap-8 items-center transition-all duration-200"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-soft-bd)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
            >
              <div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)' }}
                >
                  <Network className="w-4 h-4" style={{ color: 'var(--accent-hover)' }} />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Architecture Diagrams
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                  Three modes in one editor: Mermaid-based application diagrams, drag-and-drop infrastructure canvas, and pure AI generation from a text description.
                </p>
                <div className="flex gap-2">
                  {['Application', 'Infrastructure', 'AI Mode'].map(m => (
                    <span
                      key={m}
                      className="px-2.5 py-0.5 rounded-full text-xs"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              {/* Mini architecture mockup */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}
              >
                <div className="flex flex-col gap-2">
                  {/* Node row */}
                  <div className="flex justify-center gap-3">
                    {['API Gateway', 'Auth Service', 'Cache'].map(n => (
                      <div
                        key={n}
                        className="px-3 py-2 rounded-lg text-[10px] font-medium text-center"
                        style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)', minWidth: 70 }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  {/* connector */}
                  <div className="flex justify-center">
                    <div className="h-4 w-px" style={{ background: 'var(--accent-soft-bd)' }} />
                  </div>
                  {/* second row */}
                  <div className="flex justify-center gap-3">
                    {['Database', 'Queue', 'Storage'].map(n => (
                      <div
                        key={n}
                        className="px-3 py-2 rounded-lg text-[10px] font-medium text-center"
                        style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', minWidth: 70 }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Simple, honest pricing.
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                All features included. Only AI generations are plan-limited.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Basic */}
            <Reveal delay={0}>
              <div
                className="rounded-2xl p-8 h-full transition-all duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Basic</p>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>₹900</span>
                    <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    '5 AI generations / month',
                    'Unlimited manual editing',
                    'Gantt, RACI, BPMN, Architecture',
                    'PDF, Word, PNG export',
                    'Cloud auto-save',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/sign-in?redirect_url=/pricing"
                  className="block text-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                >
                  Get Started
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={120}>
              <div
                className="rounded-2xl p-8 h-full relative transition-all duration-200"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--accent-soft-bd)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,58,237,0.5)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(124,58,237,0.14)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-soft-bd)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(124,58,237,0.08)';
                }}
              >
                {/* Popular badge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Most Popular
                </div>

                <div className="mb-6 mt-2">
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--accent-hover)' }}>Pro</p>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>₹2,000</span>
                    <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/month</span>
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  {[
                    '12 AI generations / month',
                    'Unlimited manual editing',
                    'Gantt, RACI, BPMN, Architecture',
                    'PDF, Word, PNG export',
                    'Cloud auto-save',
                    'Priority support',
                    'SOW / Proposal generator',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-hover)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/sign-in?redirect_url=/pricing"
                  className="block text-center py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200"
                  style={{
                    background: 'var(--accent)',
                    boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(124,58,237,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(124,58,237,0.3)';
                  }}
                >
                  Start with Pro
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="py-32 px-6 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 60% 60% at 50% 100%, rgba(124,58,237,0.14), transparent),
            var(--bg-secondary)
          `,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 100%, black, transparent)',
          }}
        />
        <Reveal>
          <div className="max-w-2xl mx-auto text-center relative">
            <h2
              className="text-5xl font-extrabold tracking-tight mb-5"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            >
              Your next project starts here.
            </h2>
            <p className="text-base mb-10" style={{ color: 'var(--text-secondary)' }}>
              Stop spending hours in Excel and Visio. Generate professional project planning artifacts in seconds with AI — and actually ship.
            </p>
            <Link
              href="/sign-in?redirect_url=/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200"
              style={{
                background: 'var(--accent)',
                boxShadow: '0 0 40px rgba(124,58,237,0.35)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(124,58,237,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(124,58,237,0.35)';
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              No credit card required · Cancel anytime
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ProjectFlow AI
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            {[
              { label: 'Pricing',  href: '/pricing' },
              { label: 'Sign in',  href: '/sign-in' },
              { label: 'Sign up',  href: '/sign-up' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            © 2025 ProjectFlow AI
          </p>
        </div>
      </footer>

      {/* Keyframe styles for this page */}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
