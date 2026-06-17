'use client';

import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { Select, AIButton, PrimaryButton } from '@/components/ui/ba-controls';
import AIGenerateModal from '@/components/ba/AIGenerateModal';
import { nextSeqId } from '@/lib/ba/defaults';
import type { TestCase, TestStatus } from '@/types/project';

const STATUSES: TestStatus[] = ['Pending', 'Pass', 'Fail'];
const STATUS_COLOR: Record<TestStatus, string> = { Pending: '#A1A1AA', Pass: '#22C55E', Fail: '#EF4444' };

const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export default function TestCaseEditor() {
  const { project, setTestCases } = useProjectStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [fStatus, setFStatus] = useState<'All' | TestStatus>('All');
  const [fReq, setFReq] = useState<'All' | string>('All');

  if (!project) return null;
  const testCases = project.testCases || [];
  const requirements = project.requirements || [];
  const userStories = project.userStories || { epics: [] };

  const reqIds = requirements.map((r) => r.reqId);

  const visible = testCases.filter(
    (t) => (fStatus === 'All' || t.status === fStatus) && (fReq === 'All' || t.requirementId === fReq),
  );

  const update = (id: string, patch: Partial<TestCase>) => setTestCases(testCases.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id: string) => setTestCases(testCases.filter((t) => t.id !== id));
  const add = () => {
    const testId = nextSeqId('TC', testCases.map((t) => t.testId));
    setTestCases([...testCases, {
      id: uuidv4(), testId, requirementId: '', description: '', preconditions: '',
      steps: [], expectedResult: '', actualResult: '', status: 'Pending', assignedTo: '',
    }]);
  };

  const acceptAI = (items: any[]) => {
    const acc = [...testCases];
    items.forEach((it) => {
      const testId = nextSeqId('TC', acc.map((t) => t.testId));
      acc.push({
        id: uuidv4(), testId, requirementId: '',
        description: String(it.description || ''), preconditions: String(it.preconditions || ''),
        steps: Array.isArray(it.steps) ? it.steps.map((s: any) => String(s)) : [],
        expectedResult: String(it.expectedResult || ''), actualResult: '',
        status: 'Pending', assignedTo: '',
      });
    });
    setTestCases(acc);
  };

  const storiesText = useMemo(
    () => userStories.epics
      .flatMap((e) => e.stories.map((s) =>
        `${s.storyId} (${e.name}): As a ${s.role}, I want ${s.goal}, so that ${s.benefit}. AC: ${s.acceptanceCriteria.map((c) => c.text).join('; ')}`))
      .join('\n'),
    [userStories],
  );

  const passing = testCases.filter((t) => t.status === 'Pass').length;

  return (
    <ModuleShell
      id="testcases-export-area"
      exportModuleId="testCases"
      title="Test Cases"
      subtitle={`${testCases.length} cases · ${passing} passing`}
      icon={ClipboardCheck}
      actions={
        <>
          <AIButton onClick={() => setAiOpen(true)}>Generate from User Stories</AIButton>
          <PrimaryButton icon={Plus} onClick={add}>Add Test Case</PrimaryButton>
        </>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Filter:</span>
        <div className="w-36">
          <Select value={fStatus} onChange={(e) => setFStatus(e.target.value as any)}>
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="w-44">
          <Select value={fReq} onChange={(e) => setFReq(e.target.value)}>
            <option value="All">All Requirements</option>
            {reqIds.map((id) => <option key={id} value={id}>{id}</option>)}
          </Select>
        </div>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>Showing {visible.length} of {testCases.length}</span>
      </div>

      {testCases.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-14 text-center" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No test cases yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Add test cases manually, or generate a draft suite from your user stories with AI.
          </p>
          <div className="flex items-center justify-center gap-2">
            <AIButton onClick={() => setAiOpen(true)}>Generate from User Stories</AIButton>
            <PrimaryButton icon={Plus} onClick={add}>Add Test Case</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 1500 }}>
              <thead>
                <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {['ID', 'Req', 'Description', 'Pre-conditions', 'Steps (one per line)', 'Expected', 'Actual', 'Status', 'Assigned', ''].map((h, i) => (
                    <th key={i} className="text-left px-2 py-2.5 font-medium" style={{ minWidth: [70, 100, 200, 160, 200, 160, 160, 110, 110, 36][i] }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((t, idx) => (
                  <tr key={t.id} className="group align-top" style={{ borderBottom: idx === visible.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                    <td className="px-2 py-2 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{t.testId}</td>
                    <td className="px-1 py-1">
                      <Select value={t.requirementId} onChange={(e) => update(t.id, { requirementId: e.target.value })}>
                        <option value="">—</option>
                        {reqIds.map((id) => <option key={id} value={id}>{id}</option>)}
                      </Select>
                    </td>
                    <td className="px-1 py-1"><textarea value={t.description} onChange={(e) => update(t.id, { description: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-primary)' }} placeholder="What this verifies" /></td>
                    <td className="px-1 py-1"><textarea value={t.preconditions} onChange={(e) => update(t.id, { preconditions: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1"><textarea value={t.steps.join('\n')} onChange={(e) => update(t.id, { steps: e.target.value.split('\n') })} className={cellInput + ' resize-y min-h-[36px] font-mono text-xs'} style={{ color: 'var(--text-secondary)' }} placeholder={'Step 1\nStep 2'} /></td>
                    <td className="px-1 py-1"><textarea value={t.expectedResult} onChange={(e) => update(t.id, { expectedResult: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1"><textarea value={t.actualResult} onChange={(e) => update(t.id, { actualResult: e.target.value })} className={cellInput + ' resize-y min-h-[36px]'} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-1">
                      <Select value={t.status} onChange={(e) => update(t.id, { status: e.target.value as TestStatus })} style={{ color: STATUS_COLOR[t.status], fontWeight: 500 }}>
                        {STATUSES.map((s) => <option key={s} value={s} style={{ color: 'var(--text-primary)' }}>{s}</option>)}
                      </Select>
                    </td>
                    <td className="px-1 py-1"><input value={t.assignedTo} onChange={(e) => update(t.id, { assignedTo: e.target.value })} className={cellInput} style={{ color: 'var(--text-secondary)' }} placeholder="—" /></td>
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => remove(t.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AIGenerateModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate Test Cases from User Stories"
        aiType="test_cases_from_stories"
        mode="data"
        sourceText={storiesText}
        sourceEmpty={storiesText.trim().length === 0}
        sourceEmptyMessage="Add user stories first (the User Stories module) — test cases are generated from them."
        sourceSummary={
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              Using {userStories.epics.reduce((n, e) => n + e.stories.length, 0)} user stor{userStories.epics.reduce((n, e) => n + e.stories.length, 0) === 1 ? 'y' : 'ies'}.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI derives positive and negative test cases with steps and expected results.</p>
          </div>
        }
        itemNoun="test cases"
        parseResult={(data) => (Array.isArray(data) ? data : data?.testCases || data?.tests || [])}
        onAccept={acceptAI}
        renderPreview={(items) => (
          <div className="space-y-2 max-h-[46vh] overflow-auto pr-1">
            {items.map((it, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{it.description}</p>
                {Array.isArray(it.steps) && it.steps.length > 0 && (
                  <ol className="mt-1 ml-4 list-decimal text-xs space-y-0.5" style={{ color: 'var(--text-muted)' }}>
                    {it.steps.slice(0, 4).map((s: any, j: number) => <li key={j}>{String(s)}</li>)}
                  </ol>
                )}
                {it.expectedResult && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}><b>Expected:</b> {it.expectedResult}</p>}
              </div>
            ))}
          </div>
        )}
      />
    </ModuleShell>
  );
}
