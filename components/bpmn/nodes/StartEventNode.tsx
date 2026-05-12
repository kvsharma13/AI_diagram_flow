'use client';

import { Handle, Position } from 'reactflow';
import { Play } from 'lucide-react';

export default function StartEventNode({ data, selected }: any) {
  return (
    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${selected ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-white' : ''}`}
      style={{ borderColor: '#22c55e', backgroundColor: '#f0fdf4' }}>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-green-500 !border-none" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-green-500 !border-none" />
      <Play className="w-5 h-5 text-green-600 fill-green-600" />
    </div>
  );
}
