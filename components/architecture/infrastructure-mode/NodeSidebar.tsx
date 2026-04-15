'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import {
  Server, Database, Cloud, Zap, Globe, HardDrive, Workflow, Cpu, Activity,
  Lock, Shield, Users, Monitor, Network, CreditCard, Mail, Box,
} from 'lucide-react';

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
  { id: 'auth', label: 'Auth', icon: Lock, color: '#eab308' },
  { id: 'shield', label: 'Firewall', icon: Shield, color: '#06b6d4' },
  { id: 'users', label: 'Users', icon: Users, color: '#8b5cf6' },
  { id: 'monitor', label: 'Monitor', icon: Monitor, color: '#14b8a6' },
  { id: 'network', label: 'Network', icon: Network, color: '#6366f1' },
  { id: 'credit-card', label: 'Payment', icon: CreditCard, color: '#f43f5e' },
  { id: 'mail', label: 'Email', icon: Mail, color: '#0ea5e9' },
  { id: 'box', label: 'Container', icon: Box, color: '#a855f7' },
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
    <div className="w-14 bg-slate-900/80 border-r border-slate-800/50 flex flex-col items-center py-2 gap-1 overflow-y-auto">
      {nodeTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            onClick={() => handleAddNode(template)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors group relative"
            title={template.label}
          >
            <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" style={{ color: undefined }} />
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-200 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {template.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
