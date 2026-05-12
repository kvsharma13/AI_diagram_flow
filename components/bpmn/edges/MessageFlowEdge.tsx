'use client';

import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export default function MessageFlowEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {},
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <path id={id} style={{ ...style, strokeWidth: 1.5, stroke: '#9ca3af', strokeDasharray: '8 4' }} className="react-flow__edge-path" d={edgePath}
        markerEnd="url(#message-arrow)" />
      <defs>
        <marker id="message-arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
        </marker>
      </defs>
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
            className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500 italic shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
