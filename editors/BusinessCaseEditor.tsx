'use client';

import { v4 as uuidv4 } from 'uuid';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { TextArea, Select } from '@/components/ui/ba-controls';
import { EMPTY_BUSINESS_CASE } from '@/lib/ba/defaults';
import type { BusinessCase, CostBenefitType, HML } from '@/types/project';

const surface = { background: 'var(--surface-1)', border: '1px solid var(--border)' };
const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';
const HMLS: HML[] = ['H', 'M', 'L'];
const HML_COLOR: Record<HML, string> = { H: '#EF4444', M: '#F59E0B', L: '#22C55E' };

function Section({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl p-5" style={surface}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h3>
      <TextArea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[90px]" placeholder={`Write the ${label.toLowerCase()}…`} />
    </div>
  );
}

export default function BusinessCaseEditor() {
  const { project, setBusinessCase } = useProjectStore();
  if (!project) return null;

  const bc = project.businessCase || EMPTY_BUSINESS_CASE();
  const upd = (patch: Partial<BusinessCase>) => setBusinessCase({ ...bc, ...patch });

  // cost-benefit rows
  const addCB = () => upd({ costBenefit: [...bc.costBenefit, { id: uuidv4(), item: '', type: 'Cost', year1: '', year2: '', year3: '', notes: '' }] });
  const updCB = (id: string, patch: Partial<BusinessCase['costBenefit'][number]>) => upd({ costBenefit: bc.costBenefit.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const delCB = (id: string) => upd({ costBenefit: bc.costBenefit.filter((r) => r.id !== id) });

  // risk rows
  const addRisk = () => upd({ risks: [...bc.risks, { id: uuidv4(), riskId: `RISK-${String(bc.risks.length + 1).padStart(3, '0')}`, description: '', likelihood: 'M', impact: 'M', mitigation: '' }] });
  const updRisk = (id: string, patch: Partial<BusinessCase['risks'][number]>) => upd({ risks: bc.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const delRisk = (id: string) => upd({ risks: bc.risks.filter((r) => r.id !== id) });

  return (
    <ModuleShell id="businesscase-export-area" exportModuleId="businessCase" title="Business Case" subtitle="Justify the investment" icon={Briefcase}>
      <div className="max-w-4xl mx-auto space-y-4">
        <Section label="Executive Summary" value={bc.executiveSummary} onChange={(v) => upd({ executiveSummary: v })} />
        <Section label="Problem Statement" value={bc.problemStatement} onChange={(v) => upd({ problemStatement: v })} />
        <Section label="Proposed Solution" value={bc.proposedSolution} onChange={(v) => upd({ proposedSolution: v })} />
        <Section label="Stakeholders" value={bc.stakeholders} onChange={(v) => upd({ stakeholders: v })} />

        {/* Cost-Benefit table */}
        <div className="rounded-xl overflow-hidden" style={surface}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Cost-Benefit Analysis</h3>
            <button onClick={addCB} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}><Plus className="w-3 h-3" /> Add row</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 820 }}>
              <thead>
                <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {['Item', 'Type', 'Year 1', 'Year 2', 'Year 3', 'Notes', ''].map((h, i) => (
                    <th key={i} className="text-left px-2 py-2.5 font-medium" style={{ minWidth: [180, 120, 90, 90, 90, 160, 36][i] }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bc.costBenefit.length === 0 && <tr><td colSpan={7} className="px-3 py-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No cost / benefit lines yet.</td></tr>}
                {bc.costBenefit.map((r, idx) => (
                  <tr key={r.id} className="group" style={{ borderBottom: idx === bc.costBenefit.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                    <td className="px-1 py-1"><input value={r.item} onChange={(e) => updCB(r.id, { item: e.target.value })} className={cellInput} style={{ color: 'var(--text-primary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1">
                      <Select value={r.type} onChange={(e) => updCB(r.id, { type: e.target.value as CostBenefitType })} style={{ color: r.type === 'Cost' ? '#EF4444' : '#22C55E', fontWeight: 500 }}>
                        <option value="Cost" style={{ color: 'var(--text-primary)' }}>Cost</option>
                        <option value="Benefit" style={{ color: 'var(--text-primary)' }}>Benefit</option>
                      </Select>
                    </td>
                    {(['year1', 'year2', 'year3'] as const).map((y) => (
                      <td key={y} className="px-1 py-1"><input value={r[y]} onChange={(e) => updCB(r.id, { [y]: e.target.value })} className={cellInput} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    ))}
                    <td className="px-1 py-1"><input value={r.notes} onChange={(e) => updCB(r.id, { notes: e.target.value })} className={cellInput} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-2 text-center"><button onClick={() => delCB(r.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100" style={{ color: '#EF4444' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risks table */}
        <div className="rounded-xl overflow-hidden" style={surface}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Risks</h3>
            <button onClick={addRisk} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}><Plus className="w-3 h-3" /> Add risk</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 820 }}>
              <thead>
                <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {['Risk ID', 'Description', 'Likelihood', 'Impact', 'Mitigation', ''].map((h, i) => (
                    <th key={i} className="text-left px-2 py-2.5 font-medium" style={{ minWidth: [90, 240, 110, 100, 240, 36][i] }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bc.risks.length === 0 && <tr><td colSpan={6} className="px-3 py-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No risks logged yet.</td></tr>}
                {bc.risks.map((r, idx) => (
                  <tr key={r.id} className="group align-top" style={{ borderBottom: idx === bc.risks.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                    <td className="px-2 py-2 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{r.riskId}</td>
                    <td className="px-1 py-1"><textarea value={r.description} onChange={(e) => updRisk(r.id, { description: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-primary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1">
                      <Select value={r.likelihood} onChange={(e) => updRisk(r.id, { likelihood: e.target.value as HML })} style={{ color: HML_COLOR[r.likelihood], fontWeight: 500 }}>
                        {HMLS.map((h) => <option key={h} value={h} style={{ color: 'var(--text-primary)' }}>{h}</option>)}
                      </Select>
                    </td>
                    <td className="px-1 py-1">
                      <Select value={r.impact} onChange={(e) => updRisk(r.id, { impact: e.target.value as HML })} style={{ color: HML_COLOR[r.impact], fontWeight: 500 }}>
                        {HMLS.map((h) => <option key={h} value={h} style={{ color: 'var(--text-primary)' }}>{h}</option>)}
                      </Select>
                    </td>
                    <td className="px-1 py-1"><textarea value={r.mitigation} onChange={(e) => updRisk(r.id, { mitigation: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-2 text-center"><button onClick={() => delRisk(r.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100" style={{ color: '#EF4444' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Section label="Recommendation" value={bc.recommendation} onChange={(v) => upd({ recommendation: v })} />
      </div>
    </ModuleShell>
  );
}
