'use client';

import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';

/* ERD relationship edge with crow's-foot-style ends driven by data.cardinality
   (1:1, 1:N, M:N). Editable inline when selected. */
function endMarker(id: string, kind: 'one' | 'many') {
  if (kind === 'many') {
    return (
      <marker id={id} viewBox="0 0 14 12" refX="12" refY="6" markerWidth="18" markerHeight="15" orient="auto">
        <path d="M12,1 L1,6 L12,11 M1,6 L12,6" fill="none" stroke="#6366f1" strokeWidth="1.2" />
      </marker>
    );
  }
  return (
    <marker id={id} viewBox="0 0 14 12" refX="9" refY="6" markerWidth="18" markerHeight="15" orient="auto">
      <path d="M7,1 L7,11" stroke="#6366f1" strokeWidth="1.4" />
    </marker>
  );
}

function ERDEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected }: EdgeProps) {
  const [path, lx, ly] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  const card: string = data?.cardinality || '1:N';
  const [srcKind, tgtKind]: ('one' | 'many')[] =
    card === '1:1' ? ['one', 'one'] : card === 'M:N' ? ['many', 'many'] : ['one', 'many'];
  const sMark = `erd-${id}-s`;
  const tMark = `erd-${id}-t`;

  return (
    <>
      <defs>
        {endMarker(sMark, srcKind)}
        {endMarker(tMark, tgtKind)}
      </defs>
      <path
        id={id}
        d={path}
        fill="none"
        stroke={selected ? '#4f46e5' : '#6366f1'}
        strokeWidth={1.6}
        markerStart={`url(#${sMark})`}
        markerEnd={`url(#${tMark})`}
        className="react-flow__edge-path"
      />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`, pointerEvents: 'all' }}
          className="nodrag nopan"
        >
          {selected ? (
            <select
              value={card}
              onChange={(e) => data?.__update?.({ cardinality: e.target.value })}
              className="text-[10px] bg-white border border-gray-300 rounded px-1 py-0.5 text-gray-600 shadow-sm"
            >
              <option value="1:1">1 : 1</option>
              <option value="1:N">1 : N</option>
              <option value="M:N">M : N</option>
            </select>
          ) : (
            <span className="text-[10px] bg-white/90 px-1 rounded font-medium" style={{ color: '#6366f1' }}>{card}</span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const erdEdgeTypes = { erd: ERDEdge };
