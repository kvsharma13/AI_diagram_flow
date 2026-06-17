'use client';

import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

/* One edge component for all UML use-case relationships; the kind lives on
   data.kind and is editable inline when the edge is selected. */
function UseCaseEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps) {
  const [path, lx, ly] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const kind = data?.kind || 'association';
  const dashed = kind === 'include' || kind === 'extend';
  const mId = `uc-${id}`;

  return (
    <>
      <defs>
        {kind === 'generalization' && (
          <marker id={mId} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="14" markerHeight="14" orient="auto-start-reverse">
            <path d="M1,1 L11,6 L1,11 Z" fill="#ffffff" stroke="#6b7280" strokeWidth="1" />
          </marker>
        )}
        {dashed && (
          <marker id={mId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10" fill="none" stroke="#6b7280" strokeWidth="1.5" />
          </marker>
        )}
      </defs>
      <path
        id={id}
        d={path}
        fill="none"
        stroke={selected ? '#3b82f6' : '#6b7280'}
        strokeWidth={1.8}
        strokeDasharray={dashed ? '6 4' : undefined}
        markerEnd={kind !== 'association' ? `url(#${mId})` : undefined}
        className="react-flow__edge-path"
      />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`, pointerEvents: 'all' }}
          className="nodrag nopan"
        >
          {selected ? (
            <select
              value={kind}
              onChange={(e) => data?.__update?.({ kind: e.target.value })}
              className="text-[10px] bg-white border border-gray-300 rounded px-1 py-0.5 text-gray-600 shadow-sm"
            >
              <option value="association">— association</option>
              <option value="include">«include»</option>
              <option value="extend">«extend»</option>
              <option value="generalization">▷ generalization</option>
            </select>
          ) : (kind === 'include' || kind === 'extend') ? (
            <span className="text-[10px] italic bg-white/90 px-1 rounded text-gray-500">«{kind}»</span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const useCaseEdgeTypes = { usecase: UseCaseEdge };
