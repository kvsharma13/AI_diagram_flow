'use client';

import { useEffect } from 'react';
import { useArchitectureStore } from '@/store/architectureStore';
import ModeSelector from './ModeSelector';
import dynamic from 'next/dynamic';

// Dynamically import mode components
const ApplicationMode = dynamic(() => import('./application-mode/ApplicationEditor'), {
  ssr: false,
  loading: () => <LoadingState mode="Application" />,
});

const InfrastructureMode = dynamic(() => import('./infrastructure-mode/InfrastructureEditor'), {
  ssr: false,
  loading: () => <LoadingState mode="Infrastructure" />,
});

const AIMode = dynamic(() => import('./ai-mode/AIGenerator'), {
  ssr: false,
  loading: () => <LoadingState mode="AI Generator" />,
});

function LoadingState({ mode }: { mode: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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

  // Initialize diagram if none exists
  useEffect(() => {
    if (!diagram) {
      createDiagram('My Architecture', 'application');
    }
  }, [diagram, createDiagram]);

  if (!diagram) {
    return <LoadingState mode="Editor" />;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header with Mode Selector */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Architecture Diagram
            </h2>
            <p className="text-sm text-gray-400 mt-1">Design and visualize your system architecture</p>
          </div>
        </div>
        <ModeSelector />
      </div>

      {/* Mode Content */}
      <div className="flex-1 overflow-hidden">
        {architectureMode === 'application' && <ApplicationMode />}
        {architectureMode === 'infrastructure' && <InfrastructureMode />}
        {architectureMode === 'ai' && <AIMode />}
      </div>
    </div>
  );
}
