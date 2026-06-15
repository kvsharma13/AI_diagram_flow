'use client';

import { useEffect, useState, useRef, Fragment, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Check, Calendar, Users, Network, FileText, GitBranch, Cpu,
  ChevronRight, Server, Database, Cloud, Shield, Smartphone, Globe,
  CheckCircle2, XCircle, type LucideIcon,
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

/* ─── Avatar with initials ─── */
function Avatar({ t, c, size = 18 }: { t: string; c: string; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: `linear-gradient(135deg, ${c}, ${c}aa)`,
        color: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
        border: '1.5px solid var(--surface-2)',
      }}
    >
      {t}
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

/* ════════════ Product preview panels — premium, detailed, real-product feel ════════════ */

function GanttPanel() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const rows = [
    { label: 'Discovery',   bar: [0, 1.4],   pct: 100, color: '#3B82F6' },
    { label: 'Design',      bar: [1.1, 2.6], pct: 100, color: '#38BDF8' },
    { label: 'Development', bar: [2.4, 4.9], pct: 58,  color: '#6366F1' },
    { label: 'QA Testing',  bar: [4.4, 5.5], pct: 18,  color: '#22C55E' },
    { label: 'Launch',      bar: [5.5, 6],   pct: 0,   color: '#F59E0B', milestone: true },
  ];
  const today = 3.55;
  const pos = (v: number) => `${(v / 6) * 100}%`;

  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Q3 Product Launch</h4>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'rgba(34,197,94,0.14)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>On track</span>
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>5 phases · Jan – Jun 2026 · 62% complete</p>
        </div>
        <div className="flex -space-x-2">
          {[['AM', '#3B82F6'], ['RK', '#38BDF8'], ['JD', '#6366F1'], ['SP', '#22C55E']].map(([t, c]) => (
            <Avatar key={t} t={t} c={c} size={22} />
          ))}
        </div>
      </div>

      {/* Month header */}
      <div className="flex mb-2 pl-28">
        {months.map(m => (
          <div key={m} className="flex-1 text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>{m}</div>
        ))}
      </div>

      {/* Track */}
      <div className="relative flex-1">
        {/* gridlines + today */}
        <div className="absolute inset-0 pl-28">
          <div className="relative h-full">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: pos(i), background: 'var(--divider)' }} />
            ))}
            <div className="absolute top-0 bottom-0" style={{ left: pos(today) }}>
              <div className="w-px h-full" style={{ background: 'rgba(244,114,182,0.45)' }} />
              <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full" style={{ background: '#F472B6', boxShadow: '0 0 0 3px rgba(244,114,182,0.18)' }} />
            </div>
          </div>
        </div>

        {/* rows */}
        <div className="relative flex flex-col justify-around h-full">
          {rows.map(row => (
            <div key={row.label} className="flex items-center gap-2 h-7">
              <div className="w-28 flex-shrink-0">
                <span className="text-[10px] truncate" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              </div>
              <div className="relative flex-1 h-full flex items-center">
                {row.milestone ? (
                  <div className="absolute -translate-x-1/2" style={{ left: pos(row.bar[0]) }}>
                    <div className="w-3.5 h-3.5 rotate-45 rounded-[2px]" style={{ background: `linear-gradient(135deg,${row.color},${row.color}aa)`, boxShadow: `0 0 0 3px ${row.color}22, 0 1px 3px rgba(0,0,0,0.4)` }} />
                  </div>
                ) : (
                  <div
                    className="absolute h-[18px] rounded-full overflow-hidden"
                    style={{
                      left: pos(row.bar[0]),
                      width: `${((row.bar[1] - row.bar[0]) / 6) * 100}%`,
                      background: `${row.color}26`,
                      border: `1px solid ${row.color}4d`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                    }}
                  >
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-1.5"
                      style={{ width: `${Math.max(row.pct, 6)}%`, background: `linear-gradient(90deg, ${row.color}cc, ${row.color})` }}
                    >
                      {row.pct >= 35 && <span className="text-[7px] font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{row.pct}%</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--divider)' }}>
        <div className="flex items-center gap-3">
          {[['#3B82F6', 'Discovery'], ['#6366F1', 'Build'], ['#22C55E', 'QA']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F472B6' }} />
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Today · Apr 18</span>
        </div>
      </div>
    </div>
  );
}

function RaciPanel() {
  const tasks = ['Requirements', 'Architecture', 'UI Design', 'Backend API', 'QA Testing'];
  const members = [
    { r: 'PM',       t: 'AM', c: '#3B82F6' },
    { r: 'Dev Lead', t: 'JD', c: '#6366F1' },
    { r: 'Designer', t: 'RK', c: '#38BDF8' },
    { r: 'QA',       t: 'SP', c: '#22C55E' },
  ];
  const matrix: Record<string, string[]> = {
    'Requirements': ['R', 'C', 'I', 'I'],
    'Architecture': ['A', 'R', 'C', 'I'],
    'UI Design':    ['I', 'C', 'R', 'I'],
    'Backend API':  ['A', 'R', 'I', 'C'],
    'QA Testing':   ['A', 'C', 'I', 'R'],
  };
  const meta: Record<string, { c: string; label: string }> = {
    R: { c: '#3B82F6', label: 'Responsible' },
    A: { c: '#22C55E', label: 'Accountable' },
    C: { c: '#38BDF8', label: 'Consulted' },
    I: { c: '#71717A', label: 'Informed' },
  };

  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      <div className="mb-4">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Responsibility Matrix</h4>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>5 tasks · 4 owners</p>
      </div>

      <div className="flex-1">
        <div className="grid items-center" style={{ gridTemplateColumns: '1.5fr repeat(4, 1fr)' }}>
          {/* header */}
          <div />
          {members.map(m => (
            <div key={m.r} className="flex flex-col items-center gap-1 pb-3">
              <Avatar t={m.t} c={m.c} size={24} />
              <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{m.r}</span>
            </div>
          ))}
          {/* rows */}
          {tasks.map((task, ri) => (
            <Fragment key={task}>
              <div className="text-[10px] py-2 pr-2" style={{ color: 'var(--text-secondary)', borderTop: ri ? '1px solid var(--divider)' : 'none' }}>{task}</div>
              {matrix[task].map((mark, mi) => (
                <div key={mi} className="flex items-center justify-center py-2" style={{ borderTop: ri ? '1px solid var(--divider)' : 'none' }}>
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[9px] font-bold"
                    style={{
                      background: `linear-gradient(135deg,${meta[mark].c}2e,${meta[mark].c}14)`,
                      color: meta[mark].c,
                      border: `1px solid ${meta[mark].c}4d`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >{mark}</span>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 flex-wrap" style={{ borderTop: '1px solid var(--divider)' }}>
        {Object.entries(meta).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[8px] font-bold" style={{ background: v.c + '22', color: v.c }}>{k}</span>
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* flow helpers */
function Conn({ h = 16 }: { h?: number }) {
  return (
    <div className="flex flex-col items-center" style={{ height: h }}>
      <div className="w-px flex-1" style={{ background: 'var(--border)' }} />
      <svg width="7" height="4" viewBox="0 0 7 4" fill="none">
        <path d="M0.6 0.6 L3.5 3 L6.4 0.6" stroke="var(--text-disabled)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
function FlowCard({ icon: Icon, label, sub, color }: { icon: LucideIcon; label: string; sub: string; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', minWidth: 156, boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: color + '1f', border: `1px solid ${color}3a` }}>
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
        <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      </div>
    </div>
  );
}
function FlowChip({ icon: Icon, label, color }: { icon: LucideIcon; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: color + '14', border: `1px solid ${color}38` }}>
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
      <span className="text-[9px] font-medium whitespace-nowrap" style={{ color }}>{label}</span>
    </div>
  );
}

function BpmnPanel() {
  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      <div className="mb-2">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Invoice Approval</h4>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>BPMN 2.0 · Finance lane</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Start */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '2px solid #22C55E', background: 'rgba(34,197,94,0.14)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
        </div>
        <Conn />
        <FlowCard icon={FileText} label="Submit Request" sub="Requestor" color="#3B82F6" />
        <Conn />
        {/* Gateway */}
        <div className="relative flex items-center justify-center" style={{ width: 38, height: 38 }}>
          <div className="absolute inset-0 rotate-45 rounded-[4px]" style={{ background: 'rgba(245,158,11,0.14)', border: '1.5px solid rgba(245,158,11,0.5)' }} />
          <span className="relative text-[10px] font-bold" style={{ color: '#F59E0B' }}>?</span>
        </div>
        <div className="text-[9px] mt-1.5 mb-1" style={{ color: 'var(--text-muted)' }}>Approved?</div>
        {/* Branches */}
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-semibold mb-1" style={{ color: '#22C55E' }}>Yes</span>
            <div className="w-px h-3" style={{ background: 'rgba(34,197,94,0.45)' }} />
            <div className="mt-1"><FlowChip icon={CheckCircle2} label="Process Payment" color="#22C55E" /></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-semibold mb-1" style={{ color: '#EF4444' }}>No</span>
            <div className="w-px h-3" style={{ background: 'rgba(239,68,68,0.45)' }} />
            <div className="mt-1"><FlowChip icon={XCircle} label="Return to Sender" color="#EF4444" /></div>
          </div>
        </div>
        <Conn />
        {/* End */}
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ border: '2px solid #EF4444', background: 'rgba(239,68,68,0.12)' }}>
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#EF4444' }} />
        </div>
      </div>
    </div>
  );
}

function ArchBox({ icon: Icon, label, color, wide, small }: { icon: LucideIcon; label: string; color: string; wide?: boolean; small?: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg"
      style={{
        padding: small ? '5px 8px' : '7px 11px',
        background: 'var(--surface-2)',
        border: `1px solid ${color}38`,
        minWidth: wide ? 140 : undefined,
        justifyContent: wide ? 'center' : 'flex-start',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }}
    >
      <Icon className={small ? 'w-2.5 h-2.5 flex-shrink-0' : 'w-3 h-3 flex-shrink-0'} style={{ color }} />
      <span className={`${small ? 'text-[8px]' : 'text-[9px]'} font-medium whitespace-nowrap`} style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}
function Tier() {
  return <div className="flex justify-center"><div className="w-px h-3" style={{ background: 'var(--accent-soft-bd)' }} /></div>;
}

function ArchPanel() {
  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      <div className="mb-3">
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Microservices</h4>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>3 tiers · 9 services</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2">
        {/* clients */}
        <div className="flex justify-center gap-2.5">
          <ArchBox icon={Globe} label="Web App" color="#38BDF8" />
          <ArchBox icon={Smartphone} label="Mobile" color="#38BDF8" />
        </div>
        <Tier />
        {/* gateway */}
        <div className="flex justify-center">
          <ArchBox icon={Shield} label="API Gateway" color="#3B82F6" wide />
        </div>
        <Tier />
        {/* services group */}
        <div className="rounded-xl p-2.5" style={{ border: '1px dashed var(--border)', background: 'rgba(99,102,241,0.05)' }}>
          <div className="text-[8px] mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Services</div>
          <div className="grid grid-cols-4 gap-1.5">
            {([['Auth', Shield], ['Users', Users], ['Billing', FileText], ['Reports', Network]] as [string, LucideIcon][]).map(([l, I]) => (
              <ArchBox key={l} icon={I} label={l} color="#6366F1" small />
            ))}
          </div>
        </div>
        <Tier />
        {/* data */}
        <div className="flex justify-center gap-2.5">
          <ArchBox icon={Database} label="PostgreSQL" color="#22C55E" />
          <ArchBox icon={Server} label="Redis" color="#F59E0B" />
          <ArchBox icon={Cloud} label="S3" color="#A78BFA" />
        </div>
      </div>
    </div>
  );
}

function SowPanel() {
  return (
    <div className="p-5 h-full flex flex-col overflow-hidden">
      {/* doc header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,114,182,0.14)', border: '1px solid rgba(244,114,182,0.3)' }}>
            <FileText className="w-4 h-4" style={{ color: '#F472B6' }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>Statement of Work</h4>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Acme Fintech · v1.2 · Draft</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-medium" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>PDF</span>
      </div>

      {/* doc body */}
      <div className="flex-1 rounded-lg p-3.5 overflow-hidden" style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}>
        {[
          { h: '1 · Executive Summary', lines: [96, 78] },
          { h: '2 · Scope of Work',     lines: [100, 70] },
        ].map(s => (
          <div key={s.h} className="mb-3">
            <div className="text-[9px] font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{s.h}</div>
            {s.lines.map((w, i) => (
              <div key={i} className="h-1.5 rounded-full mb-1.5" style={{ width: `${w}%`, background: 'var(--surface-hover)' }} />
            ))}
          </div>
        ))}
        {/* commercial callout */}
        <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.22)' }}>
          <div>
            <div className="text-[8px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total contract value</div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹12,00,000</div>
          </div>
          <div className="text-right">
            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Milestones</div>
            <div className="text-[10px] font-semibold" style={{ color: '#F472B6' }}>4 payments</div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Authorized</span>
          <div className="w-16 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3 h-3" style={{ color: '#22C55E' }} />
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>4 of 4 sections generated</span>
        </div>
      </div>
    </div>
  );
}

const ARTIFACTS = [
  { id: 'gantt', label: 'Gantt',        title: 'Gantt Chart',     icon: Calendar,  Panel: GanttPanel },
  { id: 'raci',  label: 'RACI',         title: 'RACI Matrix',     icon: Users,     Panel: RaciPanel  },
  { id: 'bpmn',  label: 'Process Flow', title: 'Process Flow',    icon: GitBranch, Panel: BpmnPanel  },
  { id: 'arch',  label: 'Architecture', title: 'Architecture',    icon: Network,   Panel: ArchPanel  },
  { id: 'sow',   label: 'SOW',          title: 'Proposal / SOW',  icon: FileText,  Panel: SowPanel   },
];

/* ─── Hero product window — elevated app frame, clearly visible on black ─── */
function AppPreview() {
  const [active, setActive] = useState(0);
  const total = ARTIFACTS.length;

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % total), 4200);
    return () => clearInterval(t);
  }, [total]);

  const artifact = ARTIFACTS[active];
  const Panel = artifact.Panel;
  const Icon = artifact.icon;

  return (
    <div className="relative select-none">
      {/* soft elevation ambient — hugs the window, not a hero blob */}
      <div
        className="absolute -inset-8 pointer-events-none"
        style={{ background: 'radial-gradient(58% 50% at 50% 42%, rgba(37,99,235,0.10), transparent 72%)' }}
      />

      {/* Window */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1B1E27 0%, #14171E 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 60px -24px rgba(0,0,0,0.85), 0 12px 28px -16px rgba(0,0,0,0.7)',
        }}
      >
        {/* App chrome bar */}
        <div
          className="flex items-center justify-between px-3.5 h-11"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <BrandMark className="w-5 h-5" glyph={11} />
            <span className="text-[11px] font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Acme Fintech</span>
            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-disabled)' }} />
            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-hover)' }} />
            <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{artifact.title}</span>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{ background: 'var(--accent-soft-bg)', color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)' }}
            >
              <Cpu className="w-2.5 h-2.5" /> AI
            </span>
            <div className="hidden sm:flex -space-x-2">
              <Avatar t="AM" c="#3B82F6" size={20} />
              <Avatar t="RK" c="#38BDF8" size={20} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ height: 364, position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="absolute inset-0"
            >
              <Panel />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex items-center justify-center gap-1.5 mt-5 flex-wrap">
        {ARTIFACTS.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setActive(i)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: i === active ? 'var(--surface-2)' : 'transparent',
              border: `1px solid ${i === active ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
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
