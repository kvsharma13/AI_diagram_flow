'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollText, Plus, Trash2, Check, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { Select, AIButton, PrimaryButton } from '@/components/ui/ba-controls';
import AIGenerateModal from '@/components/ba/AIGenerateModal';
import { nextSeqId } from '@/lib/ba/defaults';
import type { Epic, UserStory, MoSCoW, StoryStatus } from '@/types/project';

const PRIORITIES: MoSCoW[] = ['Must Have', 'Should Have', 'Could Have', "Won't Have"];
const STATUSES: StoryStatus[] = ['Draft', 'Ready', 'Done'];
const STATUS_COLOR: Record<StoryStatus, string> = { Draft: '#A1A1AA', Ready: '#38BDF8', Done: '#22C55E' };
const PRIORITY_COLOR: Record<MoSCoW, string> = {
  'Must Have': '#EF4444', 'Should Have': '#F59E0B', 'Could Have': '#38BDF8', "Won't Have": '#71717A',
};

const lineInput =
  'w-full bg-transparent px-2 py-1 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export default function UserStoriesEditor() {
  const { project, setUserStories } = useProjectStore();
  const [aiOpen, setAiOpen] = useState(false);

  if (!project) return null;
  const board = project.userStories || { epics: [] };
  const requirements = project.requirements || [];

  const setBoard = (epics: Epic[]) => setUserStories({ epics });
  const allStoryIds = () => board.epics.flatMap((e) => e.stories.map((s) => s.storyId));

  const addEpic = () => setBoard([...board.epics, { id: uuidv4(), name: `Epic ${board.epics.length + 1}`, stories: [] }]);
  const updateEpic = (eid: string, patch: Partial<Epic>) =>
    setBoard(board.epics.map((e) => (e.id === eid ? { ...e, ...patch } : e)));
  const deleteEpic = (eid: string) => setBoard(board.epics.filter((e) => e.id !== eid));

  const addStory = (eid: string) => {
    const storyId = nextSeqId('US', allStoryIds());
    const story: UserStory = {
      id: uuidv4(), storyId, role: '', goal: '', benefit: '',
      acceptanceCriteria: [], priority: 'Should Have', status: 'Draft',
    };
    setBoard(board.epics.map((e) => (e.id === eid ? { ...e, stories: [...e.stories, story] } : e)));
  };
  const updateStory = (eid: string, sid: string, patch: Partial<UserStory>) =>
    setBoard(board.epics.map((e) =>
      e.id === eid ? { ...e, stories: e.stories.map((s) => (s.id === sid ? { ...s, ...patch } : s)) } : e));
  const deleteStory = (eid: string, sid: string) =>
    setBoard(board.epics.map((e) => (e.id === eid ? { ...e, stories: e.stories.filter((s) => s.id !== sid) } : e)));

  const story = (eid: string, sid: string) => board.epics.find((e) => e.id === eid)?.stories.find((s) => s.id === sid);
  const addCriterion = (eid: string, sid: string) => {
    const s = story(eid, sid); if (!s) return;
    updateStory(eid, sid, { acceptanceCriteria: [...s.acceptanceCriteria, { id: uuidv4(), text: '', done: false }] });
  };
  const updateCriterion = (eid: string, sid: string, cid: string, patch: Partial<{ text: string; done: boolean }>) => {
    const s = story(eid, sid); if (!s) return;
    updateStory(eid, sid, { acceptanceCriteria: s.acceptanceCriteria.map((c) => (c.id === cid ? { ...c, ...patch } : c)) });
  };
  const deleteCriterion = (eid: string, sid: string, cid: string) => {
    const s = story(eid, sid); if (!s) return;
    updateStory(eid, sid, { acceptanceCriteria: s.acceptanceCriteria.filter((c) => c.id !== cid) });
  };

  const acceptAI = (epics: any[]) => {
    const ids = allStoryIds();
    const newEpics: Epic[] = epics.map((ep) => ({
      id: uuidv4(),
      name: String(ep.name || 'Epic'),
      stories: (ep.stories || []).map((st: any) => {
        const storyId = nextSeqId('US', ids); ids.push(storyId);
        return {
          id: uuidv4(), storyId,
          role: String(st.role || ''), goal: String(st.goal || ''), benefit: String(st.benefit || ''),
          acceptanceCriteria: (st.acceptanceCriteria || []).map((t: any) => ({ id: uuidv4(), text: String(t), done: false })),
          priority: PRIORITIES.includes(st.priority) ? st.priority : 'Should Have',
          status: 'Draft' as StoryStatus,
        };
      }),
    }));
    setBoard([...board.epics, ...newEpics]);
  };

  const storyCount = board.epics.reduce((n, e) => n + e.stories.length, 0);
  const sourceText = requirements
    .map((r) => `${r.reqId} [${r.type} / ${r.priority}] ${r.description}`)
    .join('\n');

  return (
    <ModuleShell
      id="userstories-export-area"
      exportModuleId="userStories"
      title="User Stories"
      subtitle={`${board.epics.length} epic${board.epics.length === 1 ? '' : 's'} · ${storyCount} stor${storyCount === 1 ? 'y' : 'ies'}`}
      icon={ScrollText}
      actions={
        <>
          <AIButton onClick={() => setAiOpen(true)}>Generate from Requirements</AIButton>
          <PrimaryButton icon={Plus} onClick={addEpic}>Add Epic</PrimaryButton>
        </>
      }
    >
      {board.epics.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-14 text-center" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <ScrollText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No user stories yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Create an epic and add stories, or generate a draft backlog from your requirements with AI.
          </p>
          <div className="flex items-center justify-center gap-2">
            <AIButton onClick={() => setAiOpen(true)}>Generate from Requirements</AIButton>
            <PrimaryButton icon={Plus} onClick={addEpic}>Add Epic</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-6xl">
          {board.epics.map((epic) => (
            <div key={epic.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
              {/* Epic header */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
                <input
                  value={epic.name}
                  onChange={(e) => updateEpic(epic.id, { name: e.target.value })}
                  className="text-sm font-semibold bg-transparent flex-1 px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{ color: 'var(--text-primary)' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{epic.stories.length} stories</span>
                <button onClick={() => addStory(epic.id)} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}>
                  <Plus className="w-3 h-3" /> Story
                </button>
                <button onClick={() => deleteEpic(epic.id)} className="p-1.5 rounded-lg" style={{ color: '#EF4444' }} title="Delete epic">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stories */}
              <div className="p-3 grid gap-3 md:grid-cols-2">
                {epic.stories.length === 0 && (
                  <p className="text-sm px-2 py-3" style={{ color: 'var(--text-muted)' }}>No stories in this epic yet — add one.</p>
                )}
                {epic.stories.map((s) => (
                  <div key={s.id} className="rounded-lg p-3 group" style={{ background: 'var(--surface-2)', border: '1px solid var(--divider)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{s.storyId}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-28">
                          <Select value={s.priority} onChange={(e) => updateStory(epic.id, s.id, { priority: e.target.value as MoSCoW })} style={{ color: PRIORITY_COLOR[s.priority], fontWeight: 500 }} className="!py-1 text-xs">
                            {PRIORITIES.map((p) => <option key={p} value={p} style={{ color: 'var(--text-primary)' }}>{p}</option>)}
                          </Select>
                        </div>
                        <div className="w-24">
                          <Select value={s.status} onChange={(e) => updateStory(epic.id, s.id, { status: e.target.value as StoryStatus })} style={{ color: STATUS_COLOR[s.status], fontWeight: 500 }} className="!py-1 text-xs">
                            {STATUSES.map((st) => <option key={st} value={st} style={{ color: 'var(--text-primary)' }}>{st}</option>)}
                          </Select>
                        </div>
                        <button onClick={() => deleteStory(epic.id, s.id)} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }} title="Delete story">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Story sentence */}
                    <div className="space-y-1">
                      {([['As a', 'role', 'user role'], ['I want', 'goal', 'goal'], ['so that', 'benefit', 'benefit']] as const).map(([label, key, ph]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[11px] w-12 flex-shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <input
                            value={(s as any)[key]}
                            onChange={(e) => updateStory(epic.id, s.id, { [key]: e.target.value } as Partial<UserStory>)}
                            placeholder={ph}
                            className={lineInput}
                            style={{ color: 'var(--text-primary)', background: 'var(--surface-3)' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Acceptance criteria */}
                    <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid var(--divider)' }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Acceptance criteria</span>
                        <button onClick={() => addCriterion(epic.id, s.id)} className="text-[11px] flex items-center gap-1" style={{ color: 'var(--accent-hover)' }}>
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-1">
                        {s.acceptanceCriteria.length === 0 && (
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>None yet.</p>
                        )}
                        {s.acceptanceCriteria.map((c) => (
                          <div key={c.id} className="flex items-center gap-1.5 group/c">
                            <button
                              onClick={() => updateCriterion(epic.id, s.id, c.id, { done: !c.done })}
                              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                              style={{ border: `1px solid ${c.done ? '#22C55E' : 'var(--border)'}`, background: c.done ? 'rgba(34,197,94,0.15)' : 'transparent' }}
                            >
                              {c.done && <Check className="w-3 h-3" style={{ color: '#22C55E' }} />}
                            </button>
                            <input
                              value={c.text}
                              onChange={(e) => updateCriterion(epic.id, s.id, c.id, { text: e.target.value })}
                              placeholder="Given / when / then…"
                              className="flex-1 bg-transparent text-[12px] px-1 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                              style={{ color: c.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: c.done ? 'line-through' : 'none' }}
                            />
                            <button onClick={() => deleteCriterion(epic.id, s.id, c.id)} className="p-0.5 rounded opacity-0 group-hover/c:opacity-100" style={{ color: 'var(--text-muted)' }}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <AIGenerateModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate User Stories from Requirements"
        aiType="user_stories_from_requirements"
        mode="data"
        sourceText={sourceText}
        sourceEmpty={requirements.length === 0}
        sourceEmptyMessage="Add requirements first (the Requirements module) — user stories are generated from them."
        sourceSummary={
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Using {requirements.length} requirement{requirements.length === 1 ? '' : 's'} from this project.</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI will group them into epics and write stories with acceptance criteria. Generated stories are added as a draft you can edit.</p>
          </div>
        }
        itemNoun="epics"
        parseResult={(data) => (Array.isArray(data) ? data : data?.epics || [])}
        onAccept={acceptAI}
        renderPreview={(epics) => (
          <div className="space-y-3 max-h-[46vh] overflow-auto pr-1">
            {epics.map((ep: any, i: number) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {ep.name} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>· {(ep.stories || []).length} stories</span>
                </p>
                <div className="space-y-1.5">
                  {(ep.stories || []).slice(0, 4).map((st: any, j: number) => (
                    <p key={j} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      As a <b>{st.role}</b>, I want {st.goal}{st.benefit ? <>, so that {st.benefit}</> : null}.
                    </p>
                  ))}
                  {(ep.stories || []).length > 4 && (
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>+{(ep.stories || []).length - 4} more…</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </ModuleShell>
  );
}
