'use client';

import { useEffect } from 'react';
import { Boxes } from 'lucide-react';
import { useArchitectureStore } from '@/store/architectureStore';
import ModeSelector from './ModeSelector';
import ModuleShell from '@/components/ba/ModuleShell';
import dynamic from 'next/dynamic';

// Dynamically import mode components
const InfrastructureMode = dynamic(() => import('./infrastructure-mode/InfrastructureEditor'), {
  ssr: false,
  loading: () => <LoadingState mode="Editor" />,
});

const AIMode = dynamic(() => import('./ai-mode/AIGenerator'), {
  ssr: false,
  loading: () => <LoadingState mode="AI Generator" />,
});

function LoadingState({ mode }: { mode: string }) {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-blue-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-blue-400 opacity-20"></div>
        </div>
        <p className="text-gray-300 font-medium">Loading {mode}...</p>
      </div>
    </div>
  );
}

export default function ArchitectureEditor() {
  const { diagram, architectureMode, createDiagram } = useArchitectureStore();

  // Initialize diagram if none exists — start on the AI generator.
  useEffect(() => {
    if (!diagram) {
      createDiagram('My Architecture', 'ai');
    }
  }, [diagram, createDiagram]);

  if (!diagram) {
    return <LoadingState mode="Editor" />;
  }

  // The AI generator is its own view; everything else is the canvas editor —
  // 'cloud' is the same editor with the diagram wrapped in a labeled frame.
  const isAI = architectureMode === 'ai';
  const framed = architectureMode === 'cloud';

  return (
    <ModuleShell
      id="architecture-export-area"
      title="Architecture Diagram"
      subtitle={isAI ? 'Generate from a description' : framed ? 'Cloud architecture board' : 'Flowchart diagram'}
      icon={Boxes}
      actions={<ModeSelector />}
      bodyClassName="overflow-hidden p-0"
    >
      {isAI ? <AIMode /> : <InfrastructureMode framed={framed} />}
    </ModuleShell>
  );
}
