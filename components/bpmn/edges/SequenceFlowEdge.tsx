'use client';

import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export default function SequenceFlowEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, style = {}, markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <path id={id} style={{ ...style, strokeWidth: 2, stroke: '#6b7280' }} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
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
