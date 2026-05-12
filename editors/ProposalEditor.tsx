'use client';

import { useState, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { ProposalSection, ProposalSectionType, ProposalTemplateId } from '@/types/project';
import { getTemplateSections } from '@/lib/proposalTemplates';
import ProposalTemplateSelector from '@/components/proposal/ProposalTemplateSelector';
import SectionList from '@/components/proposal/SectionList';
import SectionEditor from '@/components/proposal/SectionEditor';
import CoverPageEditor from '@/components/proposal/CoverPageEditor';
import BrandingSettings from '@/components/proposal/BrandingSettings';
import SectionAIModal from '@/components/proposal/SectionAIModal';
import ProposalExportBar from '@/components/proposal/ProposalExportBar';
import { Palette, LayoutTemplate } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function ProposalEditor() {
  const {
    project,
    setProposalDocument,
    addProposalSection,
    updateProposalSection,
    deleteProposalSection,
    reorderProposalSections,
    setProposalBranding,
    updateProposalMeta,
    snapshotDiagramToSection,
  } = useProjectStore();

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [aiSection, setAISection] = useState<ProposalSection | null>(null);

  if (!project) return null;

  const doc = project.proposalDocument || {
    sections: [],
    branding: { companyName: '', primaryColor: '#6366f1', secondaryColor: '#ec4899', fontFamily: 'Inter', headerStyle: 'modern' },
    templateId: 'blank' as ProposalTemplateId,
    title: '',
  };

  const sections = doc.sections;
  const hasContent = sections.length > 0;

  const handleTemplateSelect = (templateId: ProposalTemplateId) => {
    const templateSections = getTemplateSections(templateId);
    setProposalDocument({
      ...doc,
      sections: templateSections,
      templateId,
      title: doc.title || project.name,
    });
    setShowTemplateSelector(false);
    if (templateSections.length > 0) {
      setActiveSection(templateSections[0].id);
    }
  };

  const handleAddSection = (type: ProposalSectionType) => {
    const defaultTitles: Record<string, string> = {
      custom: 'Custom Section',
      executive_summary: 'Executive Summary',
      scope: 'Scope',
      timeline: 'Timeline',
      stakeholders: 'Stakeholders',
      architecture: 'Architecture',
      bpmn_process: 'Process Flow',
      risks: 'Risks',
      budget: 'Budget',
      deliverables: 'Deliverables',
      assumptions: 'Assumptions',
      terms: 'Terms & Conditions',
      appendix: 'Appendix',
    };

    const newSection: Omit<ProposalSection, 'id'> = {
      type,
      title: defaultTitles[type] || 'New Section',
      content: `## ${defaultTitles[type] || 'New Section'}\n\n`,
      order: sections.length,
      isVisible: true,
    };

    addProposalSection(newSection);
  };

  const handleToggleVisibility = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      updateProposalSection(id, { isVisible: !section.isVisible });
    }
  };

  const selectedSection = activeSection ? sections.find((s) => s.id === activeSection) || null : null;

  const projectContext = {
    projectName: project.name,
    ganttPhases: project.ganttPhases.map((p) => p.name),
    raciStakeholders: (project.raciStakeholders || []).map((s) => `${s.name}${s.role ? ` (${s.role})` : ''}`),
    architectureInfo: project.architectureMermaidCode ? 'Architecture diagram available' : '',
  };

  const handleAIGenerate = (section: ProposalSection) => {
    setAISection(section);
  };

  const handleAIResult = (sectionId: string, content: string) => {
    updateProposalSection(sectionId, { content });
  };

  // If no sections, show template selector or empty state
  if (!hasContent && !showTemplateSelector) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="p-4 bg-purple-100 rounded-full inline-flex mb-4">
            <LayoutTemplate className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Start Your Proposal</h2>
          <p className="text-gray-500 mb-6">
            Choose a template to get started or create a blank document.
          </p>
          <button
            onClick={() => setShowTemplateSelector(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Choose Template
          </button>
        </div>

        {showTemplateSelector && (
          <ProposalTemplateSelector
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setShowTemplateSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <LayoutTemplate className="w-4 h-4" />
          Template
        </button>
        <button
          onClick={() => setShowBranding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Palette className="w-4 h-4" />
          Branding
        </button>

        <div className="ml-auto">
          <ProposalExportBar document={doc} />
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <SectionList
          sections={sections}
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onReorder={reorderProposalSections}
          onToggleVisibility={handleToggleVisibility}
          onDelete={deleteProposalSection}
          onAddSection={handleAddSection}
        />

        {selectedSection ? (
          selectedSection.type === 'cover' ? (
            <CoverPageEditor
              document={doc}
              onUpdateMeta={updateProposalMeta}
              onUpdateBranding={setProposalBranding}
            />
          ) : (
            <SectionEditor
              section={selectedSection}
              onUpdate={updateProposalSection}
              onDelete={deleteProposalSection}
              onSnapshot={snapshotDiagramToSection}
              onAIGenerate={handleAIGenerate}
            />
          )
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
            <p>Select a section to edit</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showTemplateSelector && (
        <ProposalTemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      <BrandingSettings
        isOpen={showBranding}
        onClose={() => setShowBranding(false)}
        branding={doc.branding}
        onUpdate={setProposalBranding}
      />
      <SectionAIModal
        isOpen={!!aiSection}
        onClose={() => setAISection(null)}
        section={aiSection}
        projectContext={projectContext}
        onGenerate={handleAIResult}
      />
    </div>
  );
}
