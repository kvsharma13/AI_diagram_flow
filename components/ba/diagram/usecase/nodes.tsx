'use client';

import { Handle, Position } from 'reactflow';
import { X } from 'lucide-react';

/* UML Use-Case nodes. Inline-editable via injected data.__update / data.__delete.
   Interactive elements carry `nodrag` so React Flow doesn't start a drag. */

function ActorNode({ data, selected }: any) {
  return (
    <div className={`relative flex flex-col items-center gap-1 px-1 ${selected ? 'ring-2 ring-blue-400 ring-offset-2 rounded' : ''}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-500" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-500" />
      {selected && (
        <button onClick={() => data.__delete?.()} className="nodrag absolute -top-2 -right-2 text-red-400 bg-white rounded-full shadow-sm" title="Delete">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <svg width="34" height="46" viewBox="0 0 36 48" className="text-gray-700">
        <circle cx="18" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="18" y1="14" x2="18" y2="32" stroke="currentColor" strokeWidth="2" />
        <line x1="6" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="2" />
        <line x1="18" y1="32" x2="8" y2="46" stroke="currentColor" strokeWidth="2" />
        <line x1="18" y1="32" x2="28" y2="46" stroke="currentColor" strokeWidth="2" />
      </svg>
      <input
        value={data.label || ''}
        onChange={(e) => data.__update?.({ label: e.target.value })}
        className="nodrag text-xs text-center bg-transparent w-24 outline-none text-gray-700"
        placeholder="Actor"
      />
    </div>
  );
}

function UseCaseNode({ data, selected }: any) {
  return (
    <div
      className={`relative flex items-center justify-center px-5 py-3 bg-white border-2 ${selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-400'}`}
      style={{ borderRadius: '50%', minWidth: 124, minHeight: 56 }}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500" />
      {selected && (
        <button onClick={() => data.__delete?.()} className="nodrag absolute -top-2 -right-2 text-red-400 bg-white rounded-full shadow-sm" title="Delete">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <input
        value={data.label || ''}
        onChange={(e) => data.__update?.({ label: e.target.value })}
        className="nodrag text-xs text-center bg-transparent outline-none text-gray-800"
        style={{ width: Math.max(64, (data.label || 'Use case').length * 7) }}
        placeholder="Use case"
      />
    </div>
  );
}

function BoundaryNode({ data, selected }: any) {
  return (
    <div className={`relative w-full h-full rounded-lg border-2 border-dashed ${selected ? 'border-blue-400' : 'border-gray-400'}`} style={{ background: 'rgba(148,163,184,0.06)' }}>
      <input
        value={data.label || ''}
        onChange={(e) => data.__update?.({ label: e.target.value })}
        className="nodrag absolute top-2 left-3 text-xs font-semibold bg-transparent outline-none text-gray-500"
        placeholder="System Boundary"
      />
      {selected && (
        <button onClick={() => data.__delete?.()} className="nodrag absolute top-2 right-2 text-red-400" title="Delete">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export const useCaseNodeTypes = {
  actor: ActorNode,
  useCase: UseCaseNode,
  boundary: BoundaryNode,
};
