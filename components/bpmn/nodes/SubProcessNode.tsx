'use client';

import { Handle, Position } from 'reactflow';
import { Minus } from 'lucide-react';

export default function SubProcessNode({ data, selected }: any) {
  return (
    <div className={`group relative min-w-[200px] min-h-[80px] px-4 py-3 rounded-lg border-2 border-dashed bg-white/50 transition-all ${selected ? 'ring-2 ring-purple-400 ring-offset-2 border-purple-500' : 'border-gray-400 hover:border-purple-300'}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-purple-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-purple-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-purple-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-purple-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <div className="text-sm font-medium text-gray-700">{data.label || 'Sub-Process'}</div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
        <Minus className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
