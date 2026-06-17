'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Scale, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { TextArea, Select, AIButton } from '@/components/ui/ba-controls';
import AIGenerateModal from '@/components/ba/AIGenerateModal';
import { nextSeqId, EMPTY_GAP_ANALYSIS } from '@/lib/ba/defaults';
import type { GapAnalysis, ImpactLevel } from '@/types/project';

const IMPACTS: ImpactLevel[] = ['High', 'Medium', 'Low'];
const IMPACT_COLOR: Record<ImpactLevel, string> = { High: '#EF4444', Medium: '#F59E0B', Low: '#22C55E' };
const surface = { background: 'var(--surface-1)', border: '1px solid var(--border)' };
const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

function Section({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl p-5" style={surface}>
      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h3>
      <TextArea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[100px]" placeholder={`Write the ${label.toLowerCase()}…`} />
    </div>
  );
}

export default function GapAnalysisEditor() {
  const { project, setGapAnalysis } = useProjectStore();
  const [aiOpen, setAiOpen] = useState(false);
  if (!project) return null;

  const gap = project.gapAnalysis || EMPTY_GAP_ANALYSIS();
  const asIsToBe = project.asIsToBe;
  const upd = (patch: Partial<GapAnalysis>) => setGapAnalysis({ ...gap, ...patch });

  const addGap = () =>
    upd({ gaps: [...gap.gaps, { id: uuidv4(), gapId: nextSeqId('GAP', gap.gaps.map((g) => g.gapId)), description: '', areaAffected: '', impact: 'Medium', recommendation: '' }] });
  const updGap = (id: string, patch: Partial<GapAnalysis['gaps'][number]>) => upd({ gaps: gap.gaps.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  const delGap = (id: string) => upd({ gaps: gap.gaps.filter((g) => g.id !== id) });

  const acceptAI = (items: any[]) => {
    const acc = [...gap.gaps];
    items.forEach((it) => {
      const gapId = nextSeqId('GAP', acc.map((g) => g.gapId));
      acc.push({
        id: uuidv4(), gapId,
        description: String(it.description || ''), areaAffected: String(it.areaAffected || ''),
        impact: IMPACTS.includes(it.impact) ? it.impact : 'Medium', recommendation: String(it.recommendation || ''),
      });
    });
    upd({ gaps: acc });
  };

  const sourceText = asIsToBe
    ? [
        'AS-IS steps: ' + asIsToBe.asIs.nodes.map((n) => n.label).join(', '),
        'TO-BE steps: ' + asIsToBe.toBe.nodes.map((n) => n.label).join(', '),
        'Noted differences: ' + asIsToBe.comparison.map((c) => `${c.area}: ${c.asIsState} -> ${c.toBeState} (${c.changeType})`).join('; '),
      ].join('\n')
    : '';
  const sourceEmpty = !asIsToBe || (asIsToBe.asIs.nodes.length === 0 && asIsToBe.toBe.nodes.length === 0 && asIsToBe.comparison.length === 0);

  return (
    <ModuleShell id="gap-export-area" exportModuleId="gapAnalysis" title="Gap Analysis" subtitle={`${gap.gaps.length} gap${gap.gaps.length === 1 ? '' : 's'} identified`} icon={Scale}>
      <div className="max-w-4xl mx-auto space-y-4">
        <Section label="Current State Summary" value={gap.currentState} onChange={(v) => upd({ currentState: v })} />
        <Section label="Future State Summary" value={gap.futureState} onChange={(v) => upd({ futureState: v })} />

        {/* Gap Table */}
        <div className="rounded-xl overflow-hidden" style={surface}>
          <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Gap Table</h3>
            <div className="flex items-center gap-2">
              <AIButton onClick={() => setAiOpen(true)}>Suggest Gaps from As-Is / To-Be</AIButton>
              <button onClick={addGap} className="text-xs flex items-center gap-1 px-2 py-1.5 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}>
                <Plus className="w-3 h-3" /> Add Gap
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead>
                <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {['Gap ID', 'Gap Description', 'Area Affected', 'Impact', 'Recommendation', ''].map((h, i) => (
                    <th key={i} className="text-left px-2 py-2.5 font-medium" style={{ minWidth: [80, 240, 160, 110, 240, 36][i] }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gap.gaps.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No gaps yet — add one, or use AI to suggest gaps from your As-Is / To-Be processes.</td></tr>
                )}
                {gap.gaps.map((g, idx) => (
                  <tr key={g.id} className="group align-top" style={{ borderBottom: idx === gap.gaps.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                    <td className="px-2 py-2 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{g.gapId}</td>
                    <td className="px-1 py-1"><textarea value={g.description} onChange={(e) => updGap(g.id, { description: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-primary)' }} placeholder="The gap" /></td>
                    <td className="px-1 py-1"><input value={g.areaAffected} onChange={(e) => updGap(g.id, { areaAffected: e.target.value })} className={cellInput} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1">
                      <Select value={g.impact} onChange={(e) => updGap(g.id, { impact: e.target.value as ImpactLevel })} style={{ color: IMPACT_COLOR[g.impact], fontWeight: 500 }}>
                        {IMPACTS.map((i) => <option key={i} value={i} style={{ color: 'var(--text-primary)' }}>{i}</option>)}
                      </Select>
                    </td>
                    <td className="px-1 py-1"><textarea value={g.recommendation} onChange={(e) => updGap(g.id, { recommendation: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => delGap(g.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }}><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Section label="Impact Assessment" value={gap.impactAssessment} onChange={(v) => upd({ impactAssessment: v })} />
        <Section label="Recommendations" value={gap.recommendations} onChange={(v) => upd({ recommendations: v })} />
      </div>

      <AIGenerateModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Suggest Gaps from As-Is / To-Be"
        aiType="gaps_from_as_is_to_be"
        mode="data"
        sourceText={sourceText}
        sourceEmpty={sourceEmpty}
        sourceEmptyMessage="Build your As-Is and To-Be processes first (the As-Is / To-Be module) — gaps are suggested from the difference between them."
        sourceSummary={
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Using your As-Is / To-Be processes and noted differences.</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI suggests gaps with area, impact, and recommendation. Added as drafts you can edit.</p>
          </div>
        }
        itemNoun="gaps"
        parseResult={(data) => (Array.isArray(data) ? data : data?.gaps || [])}
        onAccept={acceptAI}
        renderPreview={(items) => (
          <div className="space-y-2 max-h-[46vh] overflow-auto pr-1">
            {items.map((it, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium" style={{ color: IMPACT_COLOR[(it.impact as ImpactLevel)] || 'var(--text-muted)' }}>{it.impact || 'Medium'} impact</span>
                  {it.areaAffected && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>· {it.areaAffected}</span>}
                </div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{it.description}</p>
                {it.recommendation && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}><b>Fix:</b> {it.recommendation}</p>}
              </div>
            ))}
          </div>
        )}
      />
    </ModuleShell>
  );
}
