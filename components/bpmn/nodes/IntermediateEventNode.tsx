'use client';

import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

export default function IntermediateEventNode({ data, selected }: any) {
  return (
    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-white' : ''}`}
      style={{ borderColor: '#eab308', backgroundColor: '#fefce8' }}>
      <div className="w-10 h-10 rounded-full border border-yellow-400 flex items-center justify-center">
        <Clock className="w-4 h-4 text-yellow-600" />
      </div>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-yellow-500 !border-none" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-yellow-500 !border-none" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-yellow-500 !border-none" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-yellow-500 !border-none" />
    </div>
  );
}
