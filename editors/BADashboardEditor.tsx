'use client';

import { useState } from 'react';
import { LayoutDashboard, ArrowRight, CheckCircle2, Circle, Layers, Download, Loader2, type LucideIcon } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { BA_MODULES } from '@/lib/ba/modules';
import { EditorType } from '@/types/project';

const surface = { background: 'var(--surface-1)', border: '1px solid var(--border)' };

function Card({ icon: Icon, title, statusText, done, onOpen, actionLabel }: {
  icon: LucideIcon; title: string; statusText: string; done: boolean; onOpen: () => void; actionLabel?: string;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col" style={surface}>
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: done ? 'rgba(34,197,94,0.12)' : 'var(--surface-3)', border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}` }}
        >
          <Icon className="w-4 h-4" style={{ color: done ? '#22C55E' : 'var(--text-muted)' }} />
        </div>
        {done ? <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} /> : <Circle className="w-4 h-4" style={{ color: 'var(--text-disabled)' }} />}
      </div>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <p className="text-xs mt-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>{statusText}</p>
      <button
        onClick={onOpen}
        className="mt-auto flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
      >
        {actionLabel || (done ? 'Open' : 'Start')} <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function BADashboardEditor({ onOpen }: { onOpen: (id: EditorType) => void }) {
  const { project } = useProjectStore();
  const [exporting, setExporting] = useState(false);
  if (!project) return null;

  const exportAll = async () => {
    setExporting(true);
    try {
      const { exportAllZip } = await import('@/lib/ba/export/builders');
      const n = await exportAllZip(project);
      if (n === 0) alert('Nothing to export yet — start filling in some modules first.');
    } catch (e) {
      alert(`Export failed: ${e instanceof Error ? e.message : 'unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  const brdFilled = !!project.brd && Object.values(project.brd).some((v) => (v || '').trim());
  const reqs = project.requirements || [];
  const reqCount = reqs.length;
  const stories = project.userStories?.epics.reduce((n, e) => n + e.stories.length, 0) || 0;
  const epics = project.userStories?.epics.length || 0;
  const ucCount = project.useCaseDiagram?.nodes.length || 0;
  const erdCount = project.erd?.nodes.length || 0;
  const asIs = project.asIsToBe?.asIs.nodes.length || 0;
  const toBe = project.asIsToBe?.toBe.nodes.length || 0;

  const tm = project.traceabilityMatrix;
  let tracePct = 0;
  if (tm && reqs.length) {
    const cols = tm.columns || [];
    const full = reqs.filter((r) => cols.length && cols.every((c) => ((tm.cells[r.reqId] || {})[c.id] || '').trim())).length;
    tracePct = Math.round((full / reqs.length) * 100);
  }

  const testCount = project.testCases?.length || 0;
  const testPass = project.testCases?.filter((t) => t.status === 'Pass').length || 0;

  const gap = project.gapAnalysis;
  const gapFilled = !!gap && (gap.gaps.length > 0 || [gap.currentState, gap.futureState, gap.impactAssessment, gap.recommendations].some((v) => (v || '').trim()));

  const bc = project.businessCase;
  const bcFilled = !!bc && (bc.costBenefit.length > 0 || bc.risks.length > 0 || [bc.executiveSummary, bc.problemStatement, bc.proposedSolution, bc.stakeholders, bc.recommendation].some((v) => (v || '').trim()));

  const genFlags = [
    (project.ganttPhases?.length || 0) > 0,
    (project.raciTasks?.length || 0) > 0,
    (project.architectureComponents?.length || 0) > 0 || !!project.architectureMermaidCode,
    (project.flowchartSteps?.length || 0) > 0,
    (project.bpmnDiagram?.nodes.length || 0) > 0,
    (project.proposalDocument?.sections.length || 0) > 0,
  ];
  const genCount = genFlags.filter(Boolean).length;

  const status: Record<string, { text: string; done: boolean }> = {
    brd: { text: brdFilled ? 'Filled' : 'Empty', done: brdFilled },
    requirements: { text: reqCount ? `${reqCount} requirement${reqCount === 1 ? '' : 's'}` : 'None yet', done: reqCount > 0 },
    userStories: { text: stories ? `${stories} stor${stories === 1 ? 'y' : 'ies'} · ${epics} epic${epics === 1 ? '' : 's'}` : 'None yet', done: stories > 0 },
    useCase: { text: ucCount ? 'Created' : 'Not started', done: ucCount > 0 },
    erd: { text: erdCount ? 'Created' : 'Not started', done: erdCount > 0 },
    asIsToBe: { text: asIs || toBe ? 'Created' : 'Not started', done: asIs + toBe > 0 },
    traceability: { text: reqs.length ? `${tracePct}% traced` : 'No requirements', done: tracePct === 100 && reqs.length > 0 },
    testCases: { text: testCount ? `${testCount} case${testCount === 1 ? '' : 's'} · ${testPass} passing` : 'None yet', done: testCount > 0 },
    gapAnalysis: { text: gapFilled ? 'Filled' : 'Empty', done: gapFilled },
    businessCase: { text: bcFilled ? 'Filled' : 'Empty', done: bcFilled },
  };

  const moduleCards = BA_MODULES.filter((m) => m.id !== 'baDashboard');
  const doneCount = moduleCards.filter((m) => status[m.id]?.done).length;
  const overall = Math.round((doneCount / moduleCards.length) * 100);

  return (
    <ModuleShell
      title="Project Dashboard"
      subtitle={`${doneCount} of ${moduleCards.length} BA modules started · ${overall}% complete`}
      icon={LayoutDashboard}
      actions={
        <button
          onClick={exportAll}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Exporting…' : 'Export All'}
        </button>
      }
    >
      <div className="max-w-5xl">
        <div className="rounded-xl p-4 mb-5" style={surface}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Overall BA progress</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{overall}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${overall}%`, background: 'var(--accent)' }} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {moduleCards.map((m) => (
            <Card key={m.id} icon={m.icon} title={m.label} statusText={status[m.id].text} done={status[m.id].done} onOpen={() => onOpen(m.id)} />
          ))}
          <Card icon={Layers} title="Artifact Generators" statusText={`${genCount} of 6 used`} done={genCount > 0} onOpen={() => onOpen('gantt')} actionLabel="Open" />
        </div>
      </div>
    </ModuleShell>
  );
}
