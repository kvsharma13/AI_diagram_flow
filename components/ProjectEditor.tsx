'use client';

import { useProjectStore } from '@/store/useProjectStore';
import GanttEditor from '@/editors/GanttEditor';
import RACIMatrixEditor from '@/editors/RACIMatrixEditor';
import ArchitectureEditor from '@/editors/ArchitectureEditor';
import FlowchartEditor from '@/editors/FlowchartEditor';
import TemplateLoader from '@/templates/TemplateLoader';

export default function ProjectEditor() {
  const { currentEditor } = useProjectStore();

  const renderEditor = () => {
    switch (currentEditor) {
      case 'gantt':
        return <GanttEditor />;
      case 'raci':
        return <RACIMatrixEditor />;
      case 'architecture':
        return <ArchitectureEditor />;
      case 'flowchart':
        return <FlowchartEditor />;
      case 'templates':
        return <TemplateLoader />;
      default:
        return <TemplateLoader />;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {renderEditor()}
    </div>
  );
}
