'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import {
  Server, Database, Cloud, Zap, Globe, HardDrive, Workflow, Cpu, Activity,
  Lock, Shield, Users, Monitor, Network, CreditCard, Mail, Box, Bell,
  Smartphone, Key, Settings, Clipboard,
} from 'lucide-react';

const nodeTemplates = [
  { id: 'ec2', label: 'EC2', icon: Server, color: '#f97316' },
  { id: 'lambda', label: 'Lambda', icon: Zap, color: '#f97316' },
  { id: 'api-gateway', label: 'API Gateway', icon: Globe, color: '#ec4899' },
  { id: 'database', label: 'Database', icon: Database, color: '#3b82f6' },
  { id: 's3', label: 'S3 Storage', icon: HardDrive, color: '#22c55e' },
  { id: 'redis', label: 'Redis', icon: Database, color: '#dc382d' },
  { id: 'queue', label: 'Queue', icon: Workflow, color: '#ec4899' },
  { id: 'worker', label: 'Worker', icon: Cpu, color: '#f97316' },
  { id: 'analytics', label: 'Analytics', icon: Activity, color: '#8b5cf6' },
  { id: 'load-balancer', label: 'Load Balancer', icon: Cloud, color: '#10b981' },
  { id: 'cloud', label: 'Cloud', icon: Cloud, color: '#06b6d4' },
  { id: 'auth', label: 'Auth', icon: Lock, color: '#eab308' },
  { id: 'shield', label: 'Firewall', icon: Shield, color: '#06b6d4' },
  { id: 'users', label: 'Users', icon: Users, color: '#8b5cf6' },
  { id: 'monitor', label: 'Monitor', icon: Monitor, color: '#14b8a6' },
  { id: 'network', label: 'Network', icon: Network, color: '#6366f1' },
  { id: 'credit-card', label: 'Payment', icon: CreditCard, color: '#f43f5e' },
  { id: 'mail', label: 'Email', icon: Mail, color: '#0ea5e9' },
  { id: 'box', label: 'Container', icon: Box, color: '#a855f7' },
  { id: 'bell', label: 'Notification', icon: Bell, color: '#f59e0b' },
  { id: 'smartphone', label: 'Mobile', icon: Smartphone, color: '#60a5fa' },
  { id: 'key', label: 'Key', icon: Key, color: '#eab308' },
  { id: 'settings', label: 'Settings', icon: Settings, color: '#64748b' },
  { id: 'clipboard', label: 'Clipboard', icon: Clipboard, color: '#34d399' },
];

interface Props {
  onClose: () => void;
}

export default function NodeSidebarDropdown({ onClose }: Props) {
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
    <div className="bg-slate-900/95 border-b border-slate-800/50 px-3 py-2">
      <div className="flex flex-wrap gap-1">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => handleAddNode(template)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-800 transition-colors group"
              title={template.label}
            >
              <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300 transition-colors">{template.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
