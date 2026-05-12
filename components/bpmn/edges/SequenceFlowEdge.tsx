'use client';

import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export default function SequenceFlowEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {}, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        className="react-flow__edge-path"
        fill="none"
        stroke="#6b7280"
        strokeWidth={2}
        markerEnd={markerEnd}
        style={style}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
            className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs text-gray-600 font-medium shadow-sm"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
