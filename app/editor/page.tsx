'use client';

import { useEffect } from 'react';
import ModernNavbar from '@/components/ModernNavbar';
import ProjectEditor from '@/components/ProjectEditor';
import { useProjectStore } from '@/store/useProjectStore';

export default function EditorPage() {
  const { project, createProject } = useProjectStore();

  // Initialize project on mount if none exists
  useEffect(() => {
    if (!project) {
      createProject('My Project');
    }
  }, [project, createProject]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <ModernNavbar />
      <div className="flex-1 overflow-hidden">
        <ProjectEditor />
      </div>
    </div>
  );
}
