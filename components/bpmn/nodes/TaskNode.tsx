'use client';

import { Handle, Position } from 'reactflow';
import { User, Settings, Code, ClipboardList } from 'lucide-react';

const taskIcons: Record<string, any> = {
  task: ClipboardList,
  userTask: User,
  serviceTask: Settings,
  scriptTask: Code,
};

export default function TaskNode({ data, selected }: any) {
  const Icon = taskIcons[data.taskType || 'task'] || ClipboardList;

  return (
    <div className={`group relative min-w-[160px] px-4 py-3 rounded-lg border-2 bg-white shadow-sm transition-all ${selected ? 'ring-2 ring-blue-400 ring-offset-2 border-blue-500' : 'border-gray-300 hover:border-blue-300'}`}>
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-none !opacity-0 group-hover:!opacity-100 transition-opacity" />
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800 truncate">{data.label || 'Task'}</span>
      </div>
      {data.assignee && (
        <div className="text-xs text-gray-400 mt-1 truncate">{data.assignee}</div>
      )}
    </div>
  );
}
