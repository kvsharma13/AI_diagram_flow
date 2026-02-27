'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import { Server, Database, Cloud, Zap, Globe, HardDrive, Workflow, Cpu, Activity } from 'lucide-react';

const nodeTemplates = [
  { id: 'ec2', label: 'EC2', icon: Server, color: '#f97316' },
  { id: 'lambda', label: 'Lambda', icon: Zap, color: '#f97316' },
  { id: 'api-gateway', label: 'API Gateway', icon: Globe, color: '#ec4899' },
  { id: 'database', label: 'Database', icon: Database, color: '#3b82f6' },
  { id: 's3', label: 'S3', icon: HardDrive, color: '#22c55e' },
  { id: 'redis', label: 'Redis', icon: Database, color: '#dc382d' },
  { id: 'queue', label: 'Queue', icon: Workflow, color: '#ec4899' },
  { id: 'worker', label: 'Worker', icon: Cpu, color: '#f97316' },
  { id: 'analytics', label: 'Analytics', icon: Activity, color: '#8b5cf6' },
  { id: 'load-balancer', label: 'Load Balancer', icon: Cloud, color: '#10b981' },
];

export default function NodeSidebar() {
  const { addNode } = useArchitectureStore();

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    addNode({
      label: template.label,
      type: template.id,
      icon: template.id,
      position: { x: 400, y: 200 },
      data: {
        bgColor: template.color,
        iconBg: template.color,
        borderColor: template.color,
      },
    });
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm">Components</h3>
        <p className="text-gray-400 text-xs mt-1">Click to add to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {nodeTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleAddNode(template)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 hover:bg-gray-700 transition-colors text-left"
              >
                <div
                  className="p-2 rounded"
                  style={{ backgroundColor: template.color }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-sm font-medium">{template.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-400">
        <p>💡 Drag nodes to position</p>
        <p>🔗 Connect nodes by dragging</p>
      </div>
    </div>
  );
}
