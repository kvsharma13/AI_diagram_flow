'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Check, Calendar, Users,
  Network, FileText, GitBranch, Cpu,
} from 'lucide-react';

/* ─── Brand mark — a small flow/graph glyph (no ✨) ─── */
function BrandMark({ className = '', glyph = 14 }: { className?: string; glyph?: number }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md ${className}`}
      style={{ background: 'var(--text-primary)' }}
    >
      <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="6" r="2.4" fill="#0B0D10" />
        <circle cx="6" cy="18" r="2.4" fill="#0B0D10" />
        <circle cx="18" cy="12" r="2.4" fill="#0B0D10" />
        <path d="M8.1 6.9 L15.9 11.1 M8.1 17.1 L15.9 12.9" stroke="#0B0D10" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

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
  { id: 'gantt', label: 'Gantt Chart',   icon: Calendar  },
  { id: 'raci',  label: 'RACI Matrix',   icon: Users     },
  { id: 'bpmn',  label: 'Process Flow',  icon: GitBranch },
  { id: 'arch',  label: 'Architecture',  icon: Network   },
  { id: 'sow',   label: 'Proposal / SOW',icon: FileText  },
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
    <div ref={ref} className="max-w-3xl mx-auto">
      {/* Prompt */}
      <div
        className="rounded-lg p-4 mb-5 font-mono text-sm"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
      >
        <div className="text-[11px] mb-2.5" style={{ color: 'var(--text-muted)' }}>Prompt</div>
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--text-muted)' }}>›</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {typed}
            <span
              className="inline-block w-px h-4 ml-0.5 align-middle"
              style={{
                background: 'var(--text-secondary)',
                animation: typed.length < prompt.length ? 'none' : 'blink 1s step-end infinite',
              }}
            />
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = activeStep >= idx;
          return (
            <div
              key={step.id}
              className="rounded-lg p-3.5 text-center transition-all duration-500"
              style={{
                background: isActive ? 'var(--surface-2)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border)' : 'var(--divider)'}`,
                opacity: isActive ? 1 : 0.45,
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center mx-auto mb-2"
                style={{ background: isActive ? 'var(--accent-soft-bg)' : 'var(--surface-2)' }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)' }} />
              </div>
              <p className="text-[11px] font-medium" style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Check className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
          Five artifacts generated — ready to edit and export
        </div>
      )}
    </div>
  );
}

/* ─── Individual artifact panels (kept colorful — this is real product UI) ─── */
function GanttPanel() {
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-3.5 h-3.5" style={{ color: '#38BDF8' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Gantt Chart — Q3 Product Launch</span>
      </div>
      <div className="flex gap-1 mb-2 pl-24">
        {['Jan','Feb','Mar','Apr','May','Jun'].map(m => (
          <div key={m} className="flex-1 text-center text-[9px]" style={{ color: 'var(--text-muted)' }}>{m}</div>
        ))}
      </div>
      {[
        { label: 'Discovery',   bar: [0, 1.5],  color: '#2563EB' },
        { label: 'Design',      bar: [1, 2.5],  color: '#38BDF8' },
        { label: 'Development', bar: [2.5, 5],  color: '#3B82F6' },
        { label: 'QA Testing',  bar: [4.5, 5.5],color: '#22C55E' },
        { label: 'Launch',      bar: [5.5, 6],  color: '#F59E0B' },
      ].map(row => (
        <div key={row.label} className="flex items-center gap-2 mb-2.5">
          <div className="w-20 text-[10px] truncate flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{row.label}</div>
          <div className="flex-1 relative h-5 rounded-md" style={{ background: 'var(--surface-3)' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left:`${(i/6)*100}%`, background:'var(--divider)' }} />
            ))}
            <div className="absolute top-0.5 bottom-0.5 rounded-sm" style={{
              left:`${(row.bar[0]/6)*100}%`,
              width:`${((row.bar[1]-row.bar[0])/6)*100}%`,
              background: row.color, opacity: 0.85,
            }} />
          </div>
        </div>
      ))}
      <div className="mt-auto flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
        {[['#2563EB','Discovery'],['#38BDF8','Design'],['#22C55E','QA']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RaciPanel() {
  const tasks = ['Requirements','Architecture','UI Design','Backend API','QA Testing'];
  const members = ['PM','Dev Lead','Designer','QA'];
  const matrix: Record<string, string[]> = {
    'Requirements': ['R','C','I','I'],
    'Architecture': ['A','R','C','I'],
    'UI Design':    ['I','C','R','I'],
    'Backend API':  ['A','R','I','C'],
    'QA Testing':   ['A','C','I','R'],
  };
  const colors: Record<string,string> = { R:'#2563EB', A:'#22C55E', C:'#38BDF8', I:'#52525B' };
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>RACI Matrix — Responsibilities</span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-2" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Task</th>
              {members.map(m => (
                <th key={m} className="pb-2 text-center" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task}>
                <td className="py-1.5 pr-2 text-[9px]" style={{ color: 'var(--text-secondary)' }}>{task}</td>
                {matrix[task].map((mark, mi) => (
                  <td key={mi} className="py-1.5 text-center">
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold"
                      style={{
                        background: colors[mark] + '18',
                        color: colors[mark],
                        border: `1px solid ${colors[mark]}30`,
                      }}
                    >{mark}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
        {[['R','Responsible','#2563EB'],['A','Accountable','#22C55E'],['C','Consulted','#38BDF8'],['I','Informed','#71717A']].map(([k,v,c]) => (
          <div key={k} className="flex items-center gap-1">
            <span className="text-[8px] font-bold" style={{ color: c as string }}>{k}</span>
            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BpmnPanel() {
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Process Flow — Approval Workflow</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {/* Start */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2" style={{ borderColor: '#22C55E', background: 'rgba(34,197,94,0.12)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
        </div>
        <div className="w-px h-4" style={{ background: 'var(--border)' }} />
        {/* Task 1 */}
        <div className="w-full max-w-[180px] py-2 px-3 rounded-lg text-center text-[10px] font-medium" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Submit Request
        </div>
        <div className="w-px h-3" style={{ background: 'var(--border)' }} />
        {/* Gateway */}
        <div className="w-8 h-8 rotate-45 flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)' }}>
          <span className="text-[9px] font-bold -rotate-45" style={{ color: '#A78BFA' }}>?</span>
        </div>
        {/* Branch */}
        <div className="flex items-start gap-6 w-full justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-3" style={{ background: 'var(--border)' }} />
            <div className="py-2 px-3 rounded-lg text-[9px] text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', width: 80 }}>Approved</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-3" style={{ background: 'var(--border)' }} />
            <div className="py-2 px-3 rounded-lg text-[9px] text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', width: 80 }}>Rejected</div>
          </div>
        </div>
        <div className="w-px h-3" style={{ background: 'var(--border)' }} />
        {/* Task 2 */}
        <div className="w-full max-w-[180px] py-2 px-3 rounded-lg text-center text-[10px] font-medium" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Notify Stakeholders
        </div>
        <div className="w-px h-3" style={{ background: 'var(--border)' }} />
        {/* End */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center border-2" style={{ borderColor: '#EF4444', background: 'rgba(239,68,68,0.10)' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
        </div>
      </div>
    </div>
  );
}

function ArchPanel() {
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-3.5 h-3.5" style={{ color: '#FB923C' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Architecture — Microservices</span>
      </div>
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {/* Row 1 */}
        <div className="flex justify-center gap-2">
          <div className="py-2 px-3 rounded-lg text-[9px] text-center flex-1 max-w-[90px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Client App</div>
          <div className="py-2 px-3 rounded-lg text-[9px] text-center flex-1 max-w-[90px]" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Mobile App</div>
        </div>
        {/* Connector */}
        <div className="flex justify-center"><div className="w-px h-4" style={{ background: 'var(--accent-soft-bd)' }} /></div>
        {/* API Gateway */}
        <div className="flex justify-center">
          <div className="py-2 px-4 rounded-lg text-[9px] text-center font-semibold" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.30)', color: '#3B82F6', minWidth: 110 }}>API Gateway</div>
        </div>
        <div className="flex justify-center"><div className="w-px h-4" style={{ background: 'var(--accent-soft-bd)' }} /></div>
        {/* Row 2 */}
        <div className="flex justify-center gap-2">
          {['Auth','Users','Billing','Reports'].map(s => (
            <div key={s} className="py-2 px-2 rounded-lg text-[8px] text-center flex-1" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.20)', color: '#FB923C' }}>{s}</div>
          ))}
        </div>
        <div className="flex justify-center"><div className="w-px h-4" style={{ background: 'var(--border)' }} /></div>
        {/* Row 3 */}
        <div className="flex justify-center gap-2">
          {['PostgreSQL','Redis','S3'].map(s => (
            <div key={s} className="py-2 px-3 rounded-lg text-[8px] text-center flex-1" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SowPanel() {
  const sections = [
    { title: 'Executive Summary',     preview: 'Scope, timeline, and deliverables for the fintech reconciliation platform.', done: true },
    { title: 'Project Scope',         preview: 'Real-time transaction reconciliation system — design, build, deploy.', done: true },
    { title: 'Timeline & Milestones', preview: 'Discovery Jan–Feb · Design Feb–Mar · Build Mar–May · Launch Jun.', done: true },
    { title: 'Commercials',           preview: 'Fixed-price ₹12,00,000 · milestone-based payment schedule.', done: false },
  ];
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <FileText className="w-3.5 h-3.5" style={{ color: '#F472B6' }} />
        <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Proposal / SOW — Generated</span>
      </div>
      <div className="flex flex-col gap-2 overflow-hidden">
        {sections.map(section => (
          <div
            key={section.title}
            className="rounded-lg px-3 py-2 flex-shrink-0"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: section.done ? 'rgba(34,197,94,0.15)' : 'var(--surface-3)',
                  border: `1px solid ${section.done ? 'rgba(34,197,94,0.35)' : 'var(--border)'}`,
                }}
              >
                {section.done && <Check className="w-2 h-2" style={{ color: '#22C55E' }} />}
              </div>
              <span className="text-[10px] font-semibold" style={{ color: section.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {section.title}
              </span>
            </div>
            <p className="text-[8px] leading-relaxed pl-5 truncate" style={{ color: 'var(--text-muted)' }}>
              {section.preview}
            </p>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="mt-auto pt-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Generation complete</span>
          <span className="text-[9px] font-medium" style={{ color: '#F472B6' }}>75%</span>
        </div>
        <div className="h-1 rounded-full w-full" style={{ background: 'var(--surface-3)' }}>
          <div className="h-1 rounded-full" style={{ width: '75%', background: '#F472B6' }} />
        </div>
      </div>
    </div>
  );
}

const ARTIFACTS = [
  { id: 'gantt', label: 'Gantt',        icon: Calendar,  Panel: GanttPanel },
  { id: 'raci',  label: 'RACI',         icon: Users,     Panel: RaciPanel  },
  { id: 'bpmn',  label: 'Process Flow', icon: GitBranch, Panel: BpmnPanel  },
  { id: 'arch',  label: 'Architecture', icon: Network,   Panel: ArchPanel  },
  { id: 'sow',   label: 'SOW',          icon: FileText,  Panel: SowPanel   },
];

/* ─── Hero product window — clean, framed, no blur theatrics ─── */
function AppPreview() {
  const [active, setActive] = useState(0);
  const total = ARTIFACTS.length;

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % total), 3800);
    return () => clearInterval(t);
  }, [total]);

  const artifact = ARTIFACTS[active];
  const Panel = artifact.Panel;
  const Icon = artifact.icon;

  return (
    <div className="select-none">
      {/* Window */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          boxShadow: '0 30px 60px -28px rgba(0,0,0,0.75)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 h-10"
          style={{ borderBottom: '1px solid var(--divider)', background: 'var(--surface-2)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
              {ARTIFACTS[active].label === 'SOW' ? 'Proposal / SOW' : ARTIFACTS[active].label}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Auto-generated</span>
        </div>
        {/* Body */}
        <div style={{ height: 320, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
        {ARTIFACTS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setActive(i)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
            style={{
              background: i === active ? 'var(--surface-2)' : 'transparent',
              border: `1px solid ${i === active ? 'var(--border)' : 'transparent'}`,
              color: i === active ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Reveal wrapper ─── */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Feature list ─── */
const FEATURES = [
  {
    icon: Cpu, accent: true,
    title: 'AI Generation Engine',
    body: 'Paste a brief project description and get a full planning suite — Gantt, RACI, BPMN, architecture, and SOW — in seconds.',
  },
  {
    icon: Calendar,
    title: 'Gantt Charts',
    body: 'Interactive timelines with drag-and-drop phases, milestones, and a clean multi-month breakdown.',
  },
  {
    icon: Users,
    title: 'RACI Matrix',
    body: 'Define clear ownership across stakeholders with dual-mark support and one-click Word export.',
  },
  {
    icon: GitBranch,
    title: 'Process Flows',
    body: 'A full BPMN 2.0 editor with swimlanes, gateways, events, and sequence flows.',
  },
  {
    icon: Network,
    title: 'Architecture Diagrams',
    body: 'Application diagrams, a drag-and-drop infrastructure canvas, and pure AI generation — three modes, one editor.',
  },
  {
    icon: FileText,
    title: 'Export Anywhere',
    body: 'Send polished deliverables to clients as PDF, Word, PNG, or SVG — no formatting work required.',
  },
];

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
          background: scrolled ? 'rgba(11,13,16,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark className="w-7 h-7" glyph={15} />
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              ProjectFlow <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
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
          <div className="flex items-center gap-4">
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-white transition-colors duration-200"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* faint neutral top vignette — no blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 90% 50% at 50% -20%, rgba(255,255,255,0.035), transparent 70%)' }}
        />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">
            {/* Left */}
            <div>
              <h1
                className="text-5xl lg:text-[64px] font-semibold leading-[1.04] mb-6"
                style={{ color: 'var(--text-primary)', letterSpacing: '-0.035em' }}
              >
                Go from brief to delivery&nbsp;plan in{' '}
                <span style={{ color: 'var(--accent-hover)' }}>one paragraph.</span>
              </h1>

              <p className="text-lg mb-9 leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Paste a few sentences about your project. Get a Gantt chart, RACI matrix, process
                flow, architecture diagram, and a client-ready SOW back — all editable, all yours.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-3 mb-10">
                <Link
                  href="/sign-in?redirect_url=/pricing"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200"
                  style={{ background: 'var(--accent)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
                >
                  Start planning
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#workflow"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  See a sample
                </Link>
              </div>

              {/* Quiet proof line */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {['Free to start', 'Export to PDF, DOCX & PNG', 'You own everything you create'].map(label => (
                  <div key={label} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — product window */}
            <div style={{ animation: 'heroIn 0.8s cubic-bezier(0.4,0,0.2,1) both' }}>
              <AppPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── CAPABILITY STRIP ── */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: 'Five artifacts', label: 'Gantt · RACI · BPMN · Arch · SOW' },
              { value: 'Seconds',        label: 'From brief to full plan' },
              { value: 'Fully editable', label: 'Drag, connect, regenerate' },
              { value: 'Export-ready',   label: 'PDF, DOCX & PNG' },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className="px-6 py-7 text-center md:text-left"
                style={{ borderLeft: i === 0 ? 'none' : '1px solid var(--divider)' }}
              >
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW DEMO ── */}
      <section id="workflow" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-xs font-medium mb-4" style={{ color: 'var(--text-muted)' }}>How it works</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                One prompt. A full delivery plan.
              </h2>
              <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Describe your project in plain language. Every planning artifact is built at once — no templates, no manual setup.
              </p>
            </div>
          </Reveal>
          <WorkflowDemo />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="max-w-2xl mb-14">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                Everything a delivery team needs.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                From kickoff to sign-off — in one place. No other tool required.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden" style={{ background: 'var(--border)' }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 70}>
                  <div
                    className="p-7 h-full transition-colors duration-200"
                    style={{ background: 'var(--surface-1)' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-1)')}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-5"
                      style={{
                        background: f.accent ? 'var(--accent-soft-bg)' : 'var(--surface-3)',
                        border: `1px solid ${f.accent ? 'var(--accent-soft-bd)' : 'var(--border)'}`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: f.accent ? 'var(--accent-hover)' : 'var(--text-secondary)' }} />
                    </div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
                Simple, honest pricing.
              </h2>
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                All features included. Only AI generations are plan-limited.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Basic */}
            <Reveal delay={0}>
              <div
                className="rounded-2xl p-8 h-full transition-colors duration-200"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              >
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Basic</p>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>₹900</span>
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
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/sign-in?redirect_url=/pricing"
                  className="block text-center py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  Get started
                </Link>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal delay={120}>
              <div
                className="rounded-2xl p-8 h-full relative transition-colors duration-200"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--accent-soft-bd)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.55)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-soft-bd)')}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--accent-hover)' }}>Pro</p>
                    <div className="flex items-end gap-2 mb-1">
                      <span className="text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>₹2,000</span>
                      <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>/month</span>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-bd)', color: 'var(--accent-hover)' }}
                  >
                    Most popular
                  </span>
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
                  className="block text-center py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200"
                  style={{ background: 'var(--accent)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
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
        className="py-32 px-6"
        style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}
      >
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-5"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            >
              Your next project starts here.
            </h2>
            <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Stop spending hours in Excel and Visio. Generate professional planning artifacts in
              seconds — then edit, connect, and ship.
            </p>
            <Link
              href="/sign-in?redirect_url=/pricing"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg text-base font-medium text-white transition-colors duration-200"
              style={{ background: 'var(--accent)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
            >
              Get started free
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
          <div className="flex items-center gap-2.5">
            <BrandMark className="w-6 h-6" glyph={13} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              ProjectFlow AI
            </span>
          </div>

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
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
              >
                {label}
              </Link>
            ))}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-disabled)' }}>
            © 2026 ProjectFlow AI
          </p>
        </div>
      </footer>

      {/* Keyframes */}
      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
