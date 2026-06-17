'use client';

import { Handle, Position } from 'reactflow';
import { Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { ERDAttribute, ERDKey } from '@/types/project';

const KEY_OPTIONS: ERDKey[] = ['regular', 'PK', 'FK', 'derived'];
const KEY_LABEL: Record<ERDKey, string> = { regular: '—', PK: 'PK', FK: 'FK', derived: 'der' };

/* ERD entity. Attributes are inline-editable; PK underlined, derived italic,
   weak entity gets a double border. Edits go through injected data.__update. */
function EntityNode({ data, selected }: any) {
  const attrs: ERDAttribute[] = data.attributes || [];
  const weak = !!data.weak;
  const setAttrs = (a: ERDAttribute[]) => data.__update?.({ attributes: a });

  return (
    <div
      className={`bg-white rounded-md shadow-sm ${selected ? 'ring-2 ring-indigo-400' : ''}`}
      style={{ minWidth: 188, border: weak ? '3px double #475569' : '1px solid #cbd5e1' }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-indigo-500" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-indigo-500" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-500" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500" />

      {/* Header */}
      <div className="px-2 py-1.5 rounded-t-md flex items-center gap-1" style={{ background: '#eef2ff', borderBottom: '1px solid #c7d2fe' }}>
        <input
          value={data.label || ''}
          onChange={(e) => data.__update?.({ label: e.target.value })}
          className="nodrag text-xs font-semibold bg-transparent outline-none text-indigo-900 w-full"
          placeholder="Entity"
        />
        <button onClick={() => data.__update?.({ weak: !weak })} className="nodrag text-[9px] px-1 rounded flex-shrink-0" style={{ color: weak ? '#4f46e5' : '#94a3b8', border: '1px solid #c7d2fe' }} title="Toggle weak entity">
          weak
        </button>
        {selected && (
          <button onClick={() => data.__delete?.()} className="nodrag text-red-400 flex-shrink-0" title="Delete entity">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Attributes */}
      <div className="py-1">
        {attrs.length === 0 && <p className="px-2 py-0.5 text-[10px] text-gray-400">No attributes</p>}
        {attrs.map((a) => (
          <div key={a.id} className="flex items-center gap-1 px-2 py-0.5 text-[11px] group/a">
            <select
              value={a.key}
              onChange={(e) => setAttrs(attrs.map((x) => (x.id === a.id ? { ...x, key: e.target.value as ERDKey } : x)))}
              className="nodrag text-[9px] bg-transparent outline-none"
              style={{ width: 32, color: '#6366f1' }}
            >
              {KEY_OPTIONS.map((k) => <option key={k} value={k}>{KEY_LABEL[k]}</option>)}
            </select>
            <input
              value={a.name}
              onChange={(e) => setAttrs(attrs.map((x) => (x.id === a.id ? { ...x, name: e.target.value } : x)))}
              className={`nodrag bg-transparent outline-none flex-1 min-w-0 ${a.key === 'PK' ? 'underline' : ''} ${a.key === 'derived' ? 'italic' : ''}`}
              style={{ color: '#1e293b' }}
              placeholder="attribute"
            />
            <input
              value={a.dataType}
              onChange={(e) => setAttrs(attrs.map((x) => (x.id === a.id ? { ...x, dataType: e.target.value } : x)))}
              className="nodrag bg-transparent outline-none w-14 text-gray-400"
              placeholder="type"
            />
            <button onClick={() => setAttrs(attrs.filter((x) => x.id !== a.id))} className="nodrag opacity-0 group-hover/a:opacity-100 text-red-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setAttrs([...attrs, { id: uuidv4(), name: '', dataType: '', key: 'regular' }])}
          className="nodrag flex items-center gap-1 px-2 py-0.5 mt-0.5 text-[10px] text-indigo-500"
        >
          <Plus className="w-3 h-3" /> attribute
        </button>
      </div>
    </div>
  );
}

export const erdNodeTypes = {
  entity: EntityNode,
  weakEntity: EntityNode,
};
