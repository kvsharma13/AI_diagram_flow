'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GitCompare, Plus, Trash2, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { Select } from '@/components/ui/ba-controls';
import BPMNCanvas from '@/components/bpmn/BPMNCanvas';
import BPMNPropertiesPanel from '@/components/bpmn/BPMNPropertiesPanel';
import { EMPTY_AS_IS_TO_BE } from '@/lib/ba/defaults';
import type { BPMNDiagram, BPMNNode, BPMNNodeType, BPMNEdge, ComparisonRow, ChangeType } from '@/types/project';

type Side = 'asIs' | 'toBe';

const ADD_TYPES: { type: BPMNNodeType; label: string }[] = [
  { type: 'startEvent', label: 'Start' },
  { type: 'task', label: 'Task' },
  { type: 'userTask', label: 'User Task' },
  { type: 'exclusiveGateway', label: 'Gateway' },
  { type: 'endEvent', label: 'End' },
];
const DEFAULT_LABEL: Record<string, string> = {
  startEvent: 'Start', endEvent: 'End', task: 'Task', userTask: 'User Task', exclusiveGateway: 'Decision',
};
const CHANGE_TYPES: ChangeType[] = ['Added', 'Removed', 'Modified', 'Unchanged'];
const CHANGE_COLOR: Record<ChangeType, string> = {
  Added: '#22C55E', Removed: '#EF4444', Modified: '#F59E0B', Unchanged: '#71717A',
};

export default function AsIsToBeEditor() {
  const { project, setAsIsToBe } = useProjectStore();
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  if (!project) return null;

  const data = project.asIsToBe || EMPTY_AS_IS_TO_BE();
  const setSideDiagram = (side: Side, diagram: BPMNDiagram) => setAsIsToBe({ ...data, [side]: diagram });
  const setComparison = (comparison: ComparisonRow[]) => setAsIsToBe({ ...data, comparison });

  const addNode = (side: Side, type: BPMNNodeType) => {
    const d = data[side];
    const node: BPMNNode = {
      id: uuidv4(), type, label: DEFAULT_LABEL[type] || type,
      position: { x: 100 + Math.random() * 220, y: 70 + Math.random() * 150 }, data: {},
    };
    setSideDiagram(side, { ...d, nodes: [...d.nodes, node] });
  };

  // selection → properties panel
  const selSide = selected?.side;
  const selDiagram = selSide ? data[selSide] : null;
  const selNode = selected && selDiagram ? selDiagram.nodes.find((n) => n.id === selected.id) || null : null;
  const selEdge = selected && selDiagram ? selDiagram.edges.find((e) => e.id === selected.id) || null : null;
  const selLane = selected && selDiagram ? selDiagram.swimlanes.find((s) => s.id === selected.id) || null : null;

  const updNode = (id: string, patch: Partial<BPMNNode>) =>
    selSide && setSideDiagram(selSide, { ...data[selSide], nodes: data[selSide].nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) });
  const updEdge = (id: string, patch: Partial<BPMNEdge>) =>
    selSide && setSideDiagram(selSide, { ...data[selSide], edges: data[selSide].edges.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const delNode = (id: string) => {
    if (!selSide) return;
    const d = data[selSide];
    setSideDiagram(selSide, { ...d, nodes: d.nodes.filter((n) => n.id !== id), edges: d.edges.filter((e) => e.source !== id && e.target !== id) });
    setSelected(null);
  };
  const delEdge = (id: string) => {
    if (!selSide) return;
    setSideDiagram(selSide, { ...data[selSide], edges: data[selSide].edges.filter((e) => e.id !== id) });
    setSelected(null);
  };

  // comparison rows
  const addRow = () =>
    setComparison([...data.comparison, { id: uuidv4(), area: '', asIsState: '', toBeState: '', changeType: 'Modified' }]);
  const updRow = (id: string, patch: Partial<ComparisonRow>) =>
    setComparison(data.comparison.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const delRow = (id: string) => setComparison(data.comparison.filter((r) => r.id !== id));

  const Panel = ({ side, title }: { side: Side; title: string }) => {
    const d = data[side];
    return (
      <div className="rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {ADD_TYPES.map((a) => (
              <button
                key={a.type}
                onClick={() => addNode(side, a.type)}
                className="text-[11px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                <Plus className="w-2.5 h-2.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 340 }}>
          <BPMNCanvas
            nodes={d.nodes}
            edges={d.edges}
            swimlanes={d.swimlanes}
            onNodesChange={(nodes) => setSideDiagram(side, { ...data[side], nodes })}
            onEdgesChange={(edges) => setSideDiagram(side, { ...data[side], edges })}
            onNodeSelect={(id) => setSelected(id ? { side, id } : null)}
            onEdgeSelect={(id) => setSelected(id ? { side, id } : null)}
          />
        </div>
      </div>
    );
  };

  return (
    <ModuleShell
      id="asistobe-export-area"
      exportModuleId="asIsToBe"
      title="As-Is / To-Be"
      subtitle={`${data.asIs.nodes.length} as-is · ${data.toBe.nodes.length} to-be · ${data.comparison.length} differences`}
      icon={GitCompare}
    >
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Panel side="asIs" title="As-Is (current state)" />
        <Panel side="toBe" title="To-Be (future state)" />
      </div>

      {/* Comparison table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Differences</h3>
          <button onClick={addRow} className="text-xs flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: 'var(--accent-hover)', border: '1px solid var(--accent-soft-bd)', background: 'var(--accent-soft-bg)' }}>
            <Plus className="w-3 h-3" /> Add difference
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 760 }}>
            <thead>
              <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                {['Area', 'As-Is State', 'To-Be State', 'Change Type', ''].map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 font-medium" style={{ color: 'var(--text-muted)', width: i === 3 ? 160 : i === 4 ? 40 : undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.comparison.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No differences noted yet — add a row to compare the two processes.</td></tr>
              )}
              {data.comparison.map((r, idx) => (
                <tr key={r.id} className="group" style={{ borderBottom: idx === data.comparison.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                  {(['area', 'asIsState', 'toBeState'] as const).map((k) => (
                    <td key={k} className="px-1 py-1">
                      <input
                        value={r[k]}
                        onChange={(e) => updRow(r.id, { [k]: e.target.value })}
                        className="w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        style={{ color: 'var(--text-primary)' }}
                        placeholder="—"
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1">
                    <Select value={r.changeType} onChange={(e) => updRow(r.id, { changeType: e.target.value as ChangeType })} style={{ color: CHANGE_COLOR[r.changeType], fontWeight: 500 }}>
                      {CHANGE_TYPES.map((c) => <option key={c} value={c} style={{ color: 'var(--text-primary)' }}>{c}</option>)}
                    </Select>
                  </td>
                  <td className="px-1 py-1 text-center">
                    <button onClick={() => delRow(r.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#EF4444' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Properties drawer (reuses the BPMN properties panel) */}
      {selected && (selNode || selEdge || selLane) && (
        <div className="fixed right-0 top-0 bottom-0 z-40 w-72 shadow-2xl overflow-auto bg-white">
          <BPMNPropertiesPanel
            selectedNode={selNode}
            selectedEdge={selEdge}
            selectedSwimlane={selLane}
            swimlanes={selDiagram?.swimlanes || []}
            onUpdateNode={updNode}
            onUpdateEdge={updEdge}
            onUpdateSwimlane={() => {}}
            onDeleteNode={delNode}
            onDeleteEdge={delEdge}
            onDeleteSwimlane={() => {}}
            onClose={() => setSelected(null)}
          />
          <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
      )}
    </ModuleShell>
  );
}
