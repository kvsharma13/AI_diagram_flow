'use client';

import { Handle, Position } from 'reactflow';
import { Square } from 'lucide-react';

export default function EndEventNode({ data, selected }: any) {
  return (
    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-[3px] transition-all ${selected ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-white' : ''}`}
      style={{ borderColor: '#ef4444', backgroundColor: '#fef2f2' }}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-red-500 !border-none" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-red-500 !border-none" />
      <Square className="w-4 h-4 text-red-600 fill-red-600" />
    </div>
  );
}
