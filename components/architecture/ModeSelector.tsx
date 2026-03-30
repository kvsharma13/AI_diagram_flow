'use client';

import { useArchitectureStore } from '@/store/architectureStore';
import { ArchitectureMode } from '@/types/architecture';
import { Layers, Cloud, Sparkles } from 'lucide-react';

const modes: {
  id: ArchitectureMode;
  label: string;
  icon: any;
  description: string;
}[] = [
  {
    id: 'application',
    label: 'Application',
    icon: Layers,
    description: 'Logical software architecture with layers',
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Cloud,
    description: 'Cloud infrastructure deployment view',
  },
  {
    id: 'ai',
    label: 'AI Generate',
    icon: Sparkles,
    description: 'Auto-generate architecture from description',
  },
];

export default function ModeSelector() {
  const { architectureMode, setMode } = useArchitectureStore();

  return (
    <div className="flex items-center gap-2 bg-gray-950/50 backdrop-blur-sm p-1 rounded-lg border border-gray-800/50 shadow-lg">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = architectureMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 font-medium text-sm ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-md shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
