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
    <div className="flex flex-col gap-4">
      {/* Mode Toggle Buttons */}
      <div className="flex items-center gap-2 bg-gray-950/50 backdrop-blur-sm p-1.5 rounded-xl border border-gray-800/50 w-fit shadow-xl">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = architectureMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setMode(mode.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 font-medium group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-sm">{mode.label}</span>
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 blur-xl animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Mode Description */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <p className="text-xs text-gray-500 font-medium px-3">
          {modes.find((m) => m.id === architectureMode)?.description}
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      </div>
    </div>
  );
}
