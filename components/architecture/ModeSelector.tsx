'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import { ArchitectureMode } from '@/types/architecture';
import { Cloud, Sparkles, Workflow } from 'lucide-react';

const modes: {
  id: ArchitectureMode;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    id: 'ai',
    label: 'AI Generate',
    icon: Sparkles,
    description: 'Generate an architecture from a description',
  },
  {
    id: 'infrastructure',
    label: 'Flowchart',
    icon: Workflow,
    description: 'Drag, connect and edit the diagram',
  },
  {
    id: 'cloud',
    label: 'Cloud Architecture',
    icon: Cloud,
    description: 'The same diagram wrapped in one labeled cloud frame',
  },
];

export default function ModeSelector() {
  const { architectureMode, setMode } = useArchitectureStore();

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg"
      style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
    >
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = architectureMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 font-medium text-sm"
            style={
              isActive
                ? { background: 'var(--accent)', color: '#fff' }
                : { color: 'var(--text-secondary)' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
