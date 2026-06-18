'use client';

import { useState, useMemo, Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ListChecks, Plus, Trash2, ArrowUp, ArrowDown, ChevronsUpDown, ChevronDown, ChevronRight, ScrollText, FlaskConical } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { Select, AIButton, PrimaryButton } from '@/components/ui/ba-controls';
import AIGenerateModal from '@/components/ba/AIGenerateModal';
import RequirementDrawer from '@/components/ba/RequirementDrawer';
import { nextSeqId } from '@/lib/ba/defaults';
import type { Requirement, RequirementType, MoSCoW, RequirementStatus } from '@/types/project';

const TYPES: RequirementType[] = ['Functional', 'Non-Functional'];
const PRIORITIES: MoSCoW[] = ['Must Have', 'Should Have', 'Could Have', "Won't Have"];
const STATUSES: RequirementStatus[] = ['Draft', 'Approved', 'Rejected'];

const STATUS_COLOR: Record<RequirementStatus, string> = { Draft: '#A1A1AA', Approved: '#22C55E', Rejected: '#EF4444' };
const PRIORITY_COLOR: Record<MoSCoW, string> = { 'Must Have': '#EF4444', 'Should Have': '#F59E0B', 'Could Have': '#38BDF8', "Won't Have": '#71717A' };
const PRIORITY_RANK: Record<MoSCoW, number> = { 'Must Have': 0, 'Should Have': 1, 'Could Have': 2, "Won't Have": 3 };

type SortKey = 'reqId' | 'description' | 'type' | 'priority' | 'status';
type GroupBy = 'none' | 'category' | 'parent' | 'type' | 'priority' | 'status';
const GROUP_OPTIONS: { v: GroupBy; label: string }[] = [
  { v: 'none', label: 'No grouping' }, { v: 'category', label: 'Category' }, { v: 'parent', label: 'Parent' },
  { v: 'type', label: 'Type' }, { v: 'priority', label: 'Priority' }, { v: 'status', label: 'Status' },
];

const cellInput = 'w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export default function RequirementsEditor() {
  const { project, setRequirements } = useProjectStore();
  const [aiOpen, setAiOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fType, setFType] = useState<'All' | RequirementType>('All');
  const [fPriority, setFPriority] = useState<'All' | MoSCoW>('All');
  const [fStatus, setFStatus] = useState<'All' | RequirementStatus>('All');
  const [sortKey, setSortKey] = useState<SortKey>('reqId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const requirements = useMemo(() => project?.requirements || [], [project?.requirements]);
  const testCases = useMemo(() => project?.testCases || [], [project?.testCases]);

  const visible = useMemo(() => {
    const list = requirements.filter(
      (r) => (fType === 'All' || r.type === fType) && (fPriority === 'All' || r.priority === fPriority) && (fStatus === 'All' || r.status === fStatus),
    );
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      let av: string | number = a[sortKey];
      let bv: string | number = b[sortKey];
      if (sortKey === 'priority') { av = PRIORITY_RANK[a.priority]; bv = PRIORITY_RANK[b.priority]; }
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }, [requirements, fType, fPriority, fStatus, sortKey, sortDir]);

  const groupKey = (r: Requirement): string => {
    if (groupBy === 'category') return r.category?.trim() || 'Uncategorized';
    if (groupBy === 'parent') {
      const p = requirements.find((x) => x.id === r.parentId);
      return p ? `${p.reqId} — ${(p.description || 'untitled').slice(0, 40)}` : 'No parent (top-level)';
    }
    if (groupBy === 'type') return r.type;
    if (groupBy === 'priority') return r.priority;
    if (groupBy === 'status') return r.status;
    return '';
  };

  const groups = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', items: visible }];
    const map = new Map<string, Requirement[]>();
    visible.forEach((r) => { const k = groupKey(r); if (!map.has(k)) map.set(k, []); map.get(k)!.push(r); });
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, groupBy, requirements]);

  if (!project) return null;

  const update = (id: string, patch: Partial<Requirement>) => setRequirements(requirements.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRequirements(requirements.filter((r) => r.id !== id));
  const add = () => {
    const reqId = nextSeqId('REQ', requirements.map((r) => r.reqId));
    const id = uuidv4();
    setRequirements([...requirements, { id, reqId, description: '', type: 'Functional', priority: 'Should Have', status: 'Draft', source: '' }]);
    setSelectedId(id);
  };

  const acceptAI = (items: any[]) => {
    const accumulated = [...requirements];
    items.forEach((it) => {
      const reqId = nextSeqId('REQ', accumulated.map((r) => r.reqId));
      accumulated.push({
        id: uuidv4(), reqId,
        description: String(it.description || '').trim(),
        type: TYPES.includes(it.type) ? it.type : 'Functional',
        priority: PRIORITIES.includes(it.priority) ? it.priority : 'Should Have',
        status: 'Draft',
        source: String(it.source || 'AI draft').trim(),
        category: it.category ? String(it.category).trim() : undefined,
      });
    });
    setRequirements(accumulated);
  };

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  };
  const toggleCollapse = (k: string) => setCollapsed((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const testsFor = (reqId: string) => testCases.filter((t) => t.requirementId === reqId).length;
  const categories = useMemo(() => Array.from(new Set(requirements.map((r) => r.category?.trim()).filter(Boolean) as string[])), [requirements]);
  const selected = requirements.find((r) => r.id === selectedId) || null;

  const Th = ({ k, label, className = '' }: { k: SortKey; label: string; className?: string }) => (
    <th className={`text-left px-2 py-2.5 font-medium select-none ${className}`} style={{ color: 'var(--text-muted)' }}>
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:opacity-80">
        {label}{sortKey === k ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ChevronsUpDown className="w-3 h-3 opacity-40" />}
      </button>
    </th>
  );

  const counts = { total: requirements.length, must: requirements.filter((r) => r.priority === 'Must Have').length, approved: requirements.filter((r) => r.status === 'Approved').length };

  const renderRow = (r: Requirement) => {
    const acCount = r.acceptanceCriteria?.length || 0;
    const tCount = testsFor(r.reqId);
    return (
      <tr key={r.id} className="group" style={{ borderBottom: '1px solid var(--divider)' }}>
        <td className="px-2 py-1.5 whitespace-nowrap">
          <button onClick={() => setSelectedId(r.id)} className="text-xs font-mono font-medium hover:underline" style={{ color: 'var(--accent-hover)' }}>{r.reqId}</button>
        </td>
        <td className="px-1 py-1">
          <input className={cellInput} style={{ color: 'var(--text-primary)' }} value={r.description} placeholder="Describe the requirement…" onChange={(e) => update(r.id, { description: e.target.value })} />
        </td>
        <td className="px-1 py-1">
          <Select value={r.type} onChange={(e) => update(r.id, { type: e.target.value as RequirementType })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
        </td>
        <td className="px-1 py-1">
          <Select value={r.priority} style={{ color: PRIORITY_COLOR[r.priority], fontWeight: 500 }} onChange={(e) => update(r.id, { priority: e.target.value as MoSCoW })}>{PRIORITIES.map((p) => <option key={p} value={p} style={{ color: 'var(--text-primary)' }}>{p}</option>)}</Select>
        </td>
        <td className="px-1 py-1">
          <Select value={r.status} style={{ color: STATUS_COLOR[r.status], fontWeight: 500 }} onChange={(e) => update(r.id, { status: e.target.value as RequirementStatus })}>{STATUSES.map((s) => <option key={s} value={s} style={{ color: 'var(--text-primary)' }}>{s}</option>)}</Select>
        </td>
        <td className="px-2 py-1.5">
          <button onClick={() => setSelectedId(r.id)} className="flex items-center gap-2.5" title="Open details · acceptance criteria / linked tests">
            <span className="flex items-center gap-1 text-[11px]" style={{ color: acCount ? '#22C55E' : 'var(--text-disabled)' }}><ScrollText className="w-3.5 h-3.5" />{acCount}</span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: tCount ? '#22C55E' : 'var(--text-disabled)' }}><FlaskConical className="w-3.5 h-3.5" />{tCount}</span>
          </button>
        </td>
        <td className="px-1 py-1 text-center">
          <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }} title="Delete requirement"><Trash2 className="w-4 h-4" /></button>
        </td>
      </tr>
    );
  };

  return (
    <ModuleShell
      id="requirements-export-area"
      exportModuleId="requirements"
      title="Requirements"
      subtitle={`${counts.total} total · ${counts.must} must-have · ${counts.approved} approved`}
      icon={ListChecks}
      actions={
        <>
          <AIButton onClick={() => setAiOpen(true)}>Generate from Brief</AIButton>
          <PrimaryButton icon={Plus} onClick={add}>Add Requirement</PrimaryButton>
        </>
      }
    >
      {/* Filters + grouping */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Filter:</span>
        <div className="w-36"><Select value={fType} onChange={(e) => setFType(e.target.value as any)}><option value="All">All Types</option>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select></div>
        <div className="w-36"><Select value={fPriority} onChange={(e) => setFPriority(e.target.value as any)}><option value="All">All Priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</Select></div>
        <div className="w-32"><Select value={fStatus} onChange={(e) => setFStatus(e.target.value as any)}><option value="All">All Statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></div>
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Group by:</span>
        <div className="w-36"><Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>{GROUP_OPTIONS.map((g) => <option key={g.v} value={g.v}>{g.label}</option>)}</Select></div>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>Showing {visible.length} of {counts.total}</span>
      </div>

      {requirements.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-14 text-center" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <ListChecks className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No requirements yet</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Add requirements manually, or generate a first draft from your project brief with AI.</p>
          <div className="flex items-center justify-center gap-2">
            <AIButton onClick={() => setAiOpen(true)}>Generate from Brief</AIButton>
            <PrimaryButton icon={Plus} onClick={add}>Add Requirement</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }} className="text-xs">
                  <Th k="reqId" label="ID" className="w-24" />
                  <Th k="description" label="Requirement Description" />
                  <Th k="type" label="Type" className="w-40" />
                  <Th k="priority" label="Priority" className="w-40" />
                  <Th k="status" label="Status" className="w-36" />
                  <th className="text-left px-2 py-2.5 font-medium w-24" style={{ color: 'var(--text-muted)' }}>Coverage</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <Fragment key={g.key || 'all'}>
                    {g.key !== '' && (
                      <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                        <td colSpan={7} className="px-3 py-1.5">
                          <button onClick={() => toggleCollapse(g.key)} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                            {collapsed.has(g.key) ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {g.key} <span style={{ color: 'var(--text-muted)' }}>· {g.items.length}</span>
                          </button>
                        </td>
                      </tr>
                    )}
                    {!collapsed.has(g.key) && g.items.map((r) => renderRow(r))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RequirementDrawer
        requirement={selected}
        allRequirements={requirements}
        testCases={testCases}
        categories={categories}
        onChange={(patch) => selectedId && update(selectedId, patch)}
        onDelete={() => { if (selectedId) { remove(selectedId); setSelectedId(null); } }}
        onClose={() => setSelectedId(null)}
      />

      <AIGenerateModal
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        title="Generate Requirements from Brief"
        aiType="requirements_from_brief"
        mode="text"
        textLabel="Project brief"
        textPlaceholder="Describe the project — its goals, users, key features, and any constraints…"
        itemNoun="requirements"
        parseResult={(data) => (Array.isArray(data) ? data : data?.requirements || [])}
        onAccept={acceptAI}
        renderPreview={(items) => (
          <div className="space-y-2 max-h-[46vh] overflow-auto pr-1">
            {items.map((it, i) => (
              <div key={i} className="rounded-lg p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: it.type === 'Non-Functional' ? 'rgba(167,139,250,0.15)' : 'rgba(37,99,235,0.15)', color: it.type === 'Non-Functional' ? '#A78BFA' : 'var(--accent-hover)' }}>{it.type || 'Functional'}</span>
                  {it.category && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{it.category}</span>}
                  <span className="text-[10px] font-medium ml-auto" style={{ color: PRIORITY_COLOR[(it.priority as MoSCoW)] || 'var(--text-muted)' }}>{it.priority || 'Should Have'}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{it.description}</p>
              </div>
            ))}
          </div>
        )}
      />
    </ModuleShell>
  );
}
