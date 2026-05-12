'use client';

import { Handle, Position } from 'reactflow';
import { FileText, Database } from 'lucide-react';

export default function DataObjectNode({ data, selected }: any) {
  const isStore = data.dataType === 'dataStore';
  const Icon = isStore ? Database : FileText;

  return (
    <div className={`group relative flex flex-col items-center gap-1 transition-all ${selected ? 'ring-2 ring-gray-400 ring-offset-2 rounded-lg' : ''}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-gray-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-gray-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gray-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gray-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <div className="w-10 h-12 border-2 border-gray-400 bg-gray-50 flex items-center justify-center relative" style={{ clipPath: isStore ? undefined : 'polygon(0 0, 75% 0, 100% 20%, 100% 100%, 0 100%)' }}>
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <span className="text-xs text-gray-600 font-medium max-w-[80px] truncate">{data.label || 'Data'}</span>
    </div>
  );
}
