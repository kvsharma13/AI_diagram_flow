'use client';

import { v4 as uuidv4 } from 'uuid';
import { Table as TableIcon, Plus, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { PrimaryButton } from '@/components/ui/ba-controls';
import { EMPTY_TRACEABILITY } from '@/lib/ba/defaults';
import type { TraceabilityMatrix } from '@/types/project';

type Coverage = 'full' | 'partial' | 'none';
const COV_COLOR: Record<Coverage, string> = { full: '#22C55E', partial: '#F59E0B', none: '#EF4444' };

export default function TraceabilityEditor() {
  const { project, setTraceabilityMatrix } = useProjectStore();
  if (!project) return null;

  const requirements = project.requirements || [];
  const matrix: TraceabilityMatrix =
    project.traceabilityMatrix && project.traceabilityMatrix.columns?.length
      ? project.traceabilityMatrix
      : EMPTY_TRACEABILITY();
  const columns = matrix.columns;
  const cells = matrix.cells || {};

  const setCell = (reqId: string, colId: string, value: string) =>
    setTraceabilityMatrix({ ...matrix, cells: { ...cells, [reqId]: { ...(cells[reqId] || {}), [colId]: value } } });
  const addColumn = () => setTraceabilityMatrix({ ...matrix, columns: [...columns, { id: uuidv4(), name: 'New Column' }] });
  const renameColumn = (id: string, name: string) =>
    setTraceabilityMatrix({ ...matrix, columns: columns.map((c) => (c.id === id ? { ...c, name } : c)) });
  const deleteColumn = (id: string) => {
    const newCells: Record<string, Record<string, string>> = {};
    Object.entries(cells).forEach(([rid, row]) => {
      const { [id]: _drop, ...rest } = row;
      newCells[rid] = rest;
    });
    setTraceabilityMatrix({ ...matrix, columns: columns.filter((c) => c.id !== id), cells: newCells });
  };

  const coverage = (reqId: string): Coverage => {
    const row = cells[reqId] || {};
    if (columns.length === 0) return 'none';
    const filled = columns.filter((c) => (row[c.id] || '').trim()).length;
    return filled === columns.length ? 'full' : filled > 0 ? 'partial' : 'none';
  };

  const fully = requirements.filter((r) => coverage(r.reqId) === 'full').length;
  const partial = requirements.filter((r) => coverage(r.reqId) === 'partial').length;
  const pct = requirements.length ? Math.round((fully / requirements.length) * 100) : 0;

  return (
    <ModuleShell
      id="traceability-export-area"
      exportModuleId="traceability"
      title="Requirements Traceability Matrix"
      subtitle={`${requirements.length} requirements · ${columns.length} trace columns`}
      icon={TableIcon}
      actions={<PrimaryButton icon={Plus} onClick={addColumn}>Add Column</PrimaryButton>}
    >
      {requirements.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-14 text-center" style={{ background: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <TableIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No requirements to trace</h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Rows are pulled from the <b>Requirements</b> module. Add requirements there first, then map them here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pct}% of requirements fully traced</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: COV_COLOR.full }}>{fully} full</span> · <span style={{ color: COV_COLOR.partial }}>{partial} partial</span> · <span style={{ color: COV_COLOR.none }}>{requirements.length - fully - partial} untraced</span>
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#22C55E' }} />
            </div>
          </div>

          {/* Matrix */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: 700 + columns.length * 160 }}>
                <thead>
                  <tr className="text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left px-3 py-2.5 font-medium sticky left-0" style={{ color: 'var(--text-muted)', background: 'var(--surface-1)', minWidth: 280 }}>Requirement</th>
                    {columns.map((c) => (
                      <th key={c.id} className="text-left px-2 py-2 font-medium group" style={{ color: 'var(--text-muted)', minWidth: 150 }}>
                        <div className="flex items-center gap-1">
                          <input
                            value={c.name}
                            onChange={(e) => renameColumn(c.id, e.target.value)}
                            className="bg-transparent outline-none w-full font-medium focus:ring-1 focus:ring-[var(--accent)] rounded px-1"
                            style={{ color: 'var(--text-secondary)' }}
                          />
                          <button onClick={() => deleteColumn(c.id)} className="opacity-0 group-hover:opacity-100" style={{ color: '#EF4444' }} title="Delete column">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="px-2 py-2 font-medium text-center" style={{ color: 'var(--text-muted)', width: 90 }}>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((r, idx) => {
                    const cov = coverage(r.reqId);
                    return (
                      <tr key={r.id} style={{ borderBottom: idx === requirements.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                        <td className="px-3 py-2 sticky left-0" style={{ background: 'var(--surface-1)' }}>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{r.reqId}</span>
                            <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{r.description || <i>untitled</i>}</span>
                          </div>
                        </td>
                        {columns.map((c) => (
                          <td key={c.id} className="px-1 py-1">
                            <input
                              value={(cells[r.reqId] || {})[c.id] || ''}
                              onChange={(e) => setCell(r.reqId, c.id, e.target.value)}
                              className="w-full bg-transparent px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                              style={{ color: 'var(--text-primary)' }}
                              placeholder="—"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center">
                          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: COV_COLOR[cov] }} title={cov} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </ModuleShell>
  );
}
