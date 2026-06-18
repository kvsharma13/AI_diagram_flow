'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2, Sparkles, Loader2, AlertCircle, Check, Wand2, FlaskConical, ScrollText } from 'lucide-react';
import { Field, TextInput, TextArea, Select } from '@/components/ui/ba-controls';
import type {
  Requirement, RequirementType, MoSCoW, RequirementStatus, NFRCategory, VerificationMethod, TestCase, AcceptanceCriterion,
} from '@/types/project';

const TYPES: RequirementType[] = ['Functional', 'Non-Functional'];
const PRIORITIES: MoSCoW[] = ['Must Have', 'Should Have', 'Could Have', "Won't Have"];
const STATUSES: RequirementStatus[] = ['Draft', 'Approved', 'Rejected'];
const NFR_CATEGORIES: NFRCategory[] = ['Performance', 'Security', 'Usability', 'Scalability', 'Reliability', 'Maintainability', 'Compliance', 'Other'];
const VERIFICATION: VerificationMethod[] = ['Test', 'Demonstration', 'Inspection', 'Analysis'];

const SEVERITY_COLOR: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#38BDF8' };

interface AnalystResult {
  qualityScore: number;
  issues: { severity: string; message: string }[];
  suggestedRewrite: string;
  acceptanceCriteria: string[];
}

export default function RequirementDrawer({
  requirement, allRequirements, testCases, categories, onChange, onDelete, onClose,
}: {
  requirement: Requirement | null;
  allRequirements: Requirement[];
  testCases: TestCase[];
  categories: string[];
  onChange: (patch: Partial<Requirement>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analystError, setAnalystError] = useState('');
  const [result, setResult] = useState<AnalystResult | null>(null);

  // reset AI panel when switching requirement
  useEffect(() => { setResult(null); setAnalystError(''); setAnalyzing(false); }, [requirement?.id]);

  if (!requirement) return null;
  const r = requirement;
  const ac = r.acceptanceCriteria || [];
  const linkedTests = testCases.filter((t) => t.requirementId === r.reqId);

  const setAc = (next: AcceptanceCriterion[]) => onChange({ acceptanceCriteria: next });
  const addAc = (text = '') => setAc([...ac, { id: uuidv4(), text, done: false }]);
  const updateAc = (id: string, patch: Partial<AcceptanceCriterion>) => setAc(ac.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeAc = (id: string) => setAc(ac.filter((c) => c.id !== id));

  const analyze = async () => {
    setAnalyzing(true);
    setAnalystError('');
    setResult(null);
    try {
      const input = `Type: ${r.type}${r.type === 'Non-Functional' && r.nfrCategory ? ` / ${r.nfrCategory}` : ''}\nRequirement: ${r.description}${r.fitCriterion ? `\nFit criterion: ${r.fitCriterion}` : ''}`;
      const res = await fetch('/api/ai-generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: input, type: 'requirement_analyst' }),
      });
      const payload = await res.json();
      if (!res.ok) {
        if (payload.needsSubscription) throw new Error('An active subscription is required to use AI.');
        if (payload.limitReached) throw new Error('You have reached your AI limit for this month.');
        throw new Error(payload.error || 'Analysis failed.');
      }
      setResult(payload.data as AnalystResult);
    } catch (e) {
      setAnalystError(e instanceof Error ? e.message : 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const addSuggestedAc = () => {
    if (!result?.acceptanceCriteria?.length) return;
    setAc([...ac, ...result.acceptanceCriteria.map((t) => ({ id: uuidv4(), text: String(t), done: false }))]);
  };

  const scoreColor = (s: number) => (s >= 80 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444');

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="h-full w-full max-w-[480px] flex flex-col shadow-2xl" style={{ background: 'var(--surface-1)', borderLeft: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--accent-hover)' }}>{r.reqId}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: r.type === 'Non-Functional' ? 'rgba(167,139,250,0.15)' : 'var(--accent-soft-bg)', color: r.type === 'Non-Functional' ? '#A78BFA' : 'var(--accent-hover)' }}>{r.type}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-3)')} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-5">
          <Field label="Requirement statement">
            <TextArea value={r.description} onChange={(e) => onChange({ description: e.target.value })} className="min-h-[80px]" placeholder="The system shall…" />
          </Field>

          {/* Attribute grid */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type"><Select value={r.type} onChange={(e) => onChange({ type: e.target.value as RequirementType })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select></Field>
            <Field label="Priority (MoSCoW)"><Select value={r.priority} onChange={(e) => onChange({ priority: e.target.value as MoSCoW })}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</Select></Field>
            <Field label="Status"><Select value={r.status} onChange={(e) => onChange({ status: e.target.value as RequirementStatus })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
            <Field label="Category / area">
              <TextInput list="req-drawer-categories" value={r.category || ''} onChange={(e) => onChange({ category: e.target.value })} placeholder="e.g. Authentication" />
              <datalist id="req-drawer-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </Field>
            {r.type === 'Non-Functional' && (
              <Field label="NFR category"><Select value={r.nfrCategory || ''} onChange={(e) => onChange({ nfrCategory: (e.target.value || undefined) as NFRCategory })}><option value="">—</option>{NFR_CATEGORIES.map((n) => <option key={n} value={n}>{n}</option>)}</Select></Field>
            )}
            <Field label="Verification"><Select value={r.verification || ''} onChange={(e) => onChange({ verification: (e.target.value || undefined) as VerificationMethod })}><option value="">—</option>{VERIFICATION.map((v) => <option key={v} value={v}>{v}</option>)}</Select></Field>
            <Field label="Estimate"><TextInput value={r.estimate || ''} onChange={(e) => onChange({ estimate: e.target.value })} placeholder="e.g. M / 3" /></Field>
            <Field label="Source"><TextInput value={r.source} onChange={(e) => onChange({ source: e.target.value })} placeholder="Brief / Stakeholder" /></Field>
            <Field label="Parent (decomposition)" className="col-span-2">
              <Select value={r.parentId || ''} onChange={(e) => onChange({ parentId: e.target.value || undefined })}>
                <option value="">— none (top-level)</option>
                {allRequirements.filter((x) => x.id !== r.id).map((x) => <option key={x.id} value={x.id}>{x.reqId} — {(x.description || 'untitled').slice(0, 40)}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Rationale (why it exists)"><TextArea value={r.rationale || ''} onChange={(e) => onChange({ rationale: e.target.value })} className="min-h-[56px]" placeholder="The business reason for this requirement…" /></Field>
          <Field label="Fit criterion (measurable target — esp. for NFRs)"><TextArea value={r.fitCriterion || ''} onChange={(e) => onChange({ fitCriterion: e.target.value })} className="min-h-[44px]" placeholder="e.g. responds in <2s for 95% of requests" /></Field>

          {/* Acceptance criteria */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Acceptance criteria {ac.length > 0 && <span style={{ color: 'var(--text-muted)' }}>· {ac.filter((c) => c.done).length}/{ac.length}</span>}</span>
              <button onClick={() => addAc()} className="text-[11px] flex items-center gap-1" style={{ color: 'var(--accent-hover)' }}><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="space-y-1.5">
              {ac.length === 0 && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>None yet — add manually, or use AI analysis below.</p>}
              {ac.map((c) => (
                <div key={c.id} className="flex items-center gap-2 group/ac">
                  <button onClick={() => updateAc(c.id, { done: !c.done })} className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ border: `1px solid ${c.done ? '#22C55E' : 'var(--border)'}`, background: c.done ? 'rgba(34,197,94,0.15)' : 'transparent' }}>
                    {c.done && <Check className="w-3 h-3" style={{ color: '#22C55E' }} />}
                  </button>
                  <input value={c.text} onChange={(e) => updateAc(c.id, { text: e.target.value })} placeholder="Given / when / then…" className="flex-1 bg-transparent text-[12px] px-1.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" style={{ color: c.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: c.done ? 'line-through' : 'none', background: 'var(--surface-2)' }} />
                  <button onClick={() => removeAc(c.id)} className="p-0.5 opacity-0 group-hover/ac:opacity-100" style={{ color: 'var(--text-muted)' }}><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* AI analyst */}
          <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}><Sparkles className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} /> AI analysis</span>
              <button onClick={analyze} disabled={analyzing || !r.description.trim()} className="text-xs font-medium px-2.5 py-1 rounded-lg text-white flex items-center gap-1.5 disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-600">
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}{analyzing ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
            {!result && !analystError && !analyzing && (
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Checks clarity, testability and ambiguity; suggests a rewrite and acceptance criteria.</p>
            )}
            {analystError && (
              <div className="flex items-start gap-2 text-[11px]" style={{ color: '#FCA5A5' }}><AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {analystError}</div>
            )}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Quality</span>
                  <span className="text-sm font-bold" style={{ color: scoreColor(result.qualityScore) }}>{result.qualityScore}/100</span>
                </div>
                {result.issues?.length > 0 && (
                  <div className="space-y-1">
                    {result.issues.map((iss, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="px-1 py-0.5 rounded text-[9px] font-bold uppercase flex-shrink-0" style={{ background: (SEVERITY_COLOR[iss.severity] || '#71717A') + '22', color: SEVERITY_COLOR[iss.severity] || '#71717A' }}>{iss.severity}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{iss.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                {result.issues?.length === 0 && <p className="text-[11px]" style={{ color: '#86EFAC' }}>No issues found — this requirement reads well.</p>}
                {result.suggestedRewrite?.trim() && (
                  <div className="rounded-lg p-2.5" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>Suggested rewrite</p>
                    <p className="text-[12px] mb-2" style={{ color: 'var(--text-primary)' }}>{result.suggestedRewrite}</p>
                    <button onClick={() => onChange({ description: result.suggestedRewrite })} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}><Wand2 className="w-3 h-3" /> Apply rewrite</button>
                  </div>
                )}
                {result.acceptanceCriteria?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Suggested acceptance criteria</p>
                      <button onClick={addSuggestedAc} className="text-[11px] flex items-center gap-1" style={{ color: 'var(--accent-hover)' }}><Plus className="w-3 h-3" /> Add all</button>
                    </div>
                    <ul className="space-y-0.5">{result.acceptanceCriteria.map((c, i) => <li key={i} className="text-[11px] flex gap-1.5" style={{ color: 'var(--text-secondary)' }}><span style={{ color: 'var(--text-disabled)' }}>•</span> {c}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Traceability / coverage */}
          <div className="rounded-xl p-3.5" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Traceability</span>
            <div className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <ScrollText className="w-3.5 h-3.5" style={{ color: ac.length ? '#22C55E' : 'var(--text-disabled)' }} />
                {ac.length ? `${ac.length} acceptance criterion${ac.length === 1 ? '' : 'a'}` : 'No acceptance criteria yet'}
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <FlaskConical className="w-3.5 h-3.5" style={{ color: linkedTests.length ? '#22C55E' : 'var(--text-disabled)' }} />
                {linkedTests.length ? `Verified by ${linkedTests.map((t) => t.testId).join(', ')}` : 'No test cases linked yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onDelete} className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          <span className="text-[11px]" style={{ color: 'var(--text-disabled)' }}>Changes save automatically</span>
        </div>
      </div>
    </div>
  );
}
