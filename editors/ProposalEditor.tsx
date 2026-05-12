'use client';

import { useState } from 'react';
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
import GenerateSOWModal from '@/components/proposal/GenerateSOWModal';
import { Palette, LayoutTemplate, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { captureDiagramSnapshot } from '@/lib/proposal/diagramSnapshot';

// Which diagram source to auto-embed per section title keywords
const DIAGRAM_INJECTION_MAP: Array<{ keywords: string[]; sourceId: string }> = [
  { keywords: ['timeline', 'gantt', 'delivery', 'schedule', 'phase'], sourceId: 'gantt-export-area' },
  { keywords: ['architecture', 'technical', 'system', 'solution'], sourceId: 'architecture-export-area' },
  { keywords: ['process', 'bpmn', 'workflow', 'flow'], sourceId: 'bpmn-export-area' },
  { keywords: ['stakeholder', 'raci', 'governance', 'responsibility', 'team'], sourceId: 'raci-export-area' },
];

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
  const [showGenerateSOW, setShowGenerateSOW] = useState(false);
  const [isGeneratingSOW, setIsGeneratingSOW] = useState(false);
  const [generateSOWError, setGenerateSOWError] = useState('');

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

  const handleGenerateFullSOW = async (prompt: string) => {
    setIsGeneratingSOW(true);
    setGenerateSOWError('');

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput: prompt, type: 'full_sow' }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate SOW');
      }

      const result = await response.json();
      const sowData = result.data;

      if (!sowData?.sections?.length) throw new Error('No sections returned from AI');

      // Build sections with IDs and inject diagrams where available
      const newSections: ProposalSection[] = await Promise.all(
        sowData.sections.map(async (s: { type: string; title: string; content: string }, idx: number) => {
          const titleLower = s.title.toLowerCase();

          // Find matching diagram source for this section
          const match = DIAGRAM_INJECTION_MAP.find(({ keywords }) =>
            keywords.some(kw => titleLower.includes(kw))
          );

          let diagramSnapshot: string | undefined;
          if (match) {
            const snap = await captureDiagramSnapshot(match.sourceId).catch(() => null);
            if (snap) diagramSnapshot = snap;
          }

          return {
            id: uuidv4(),
            type: (s.type as ProposalSectionType) || 'custom',
            title: s.title,
            content: s.content,
            order: idx,
            isVisible: true,
            ...(diagramSnapshot ? { diagramSnapshot } : {}),
          };
        })
      );

      setProposalDocument({
        ...doc,
        sections: newSections,
        title: sowData.title || project.name,
        subtitle: sowData.subtitle || '',
        templateId: 'sow',
      });

      setShowGenerateSOW(false);
      if (newSections.length > 0) setActiveSection(newSections[0].id);
    } catch (err) {
      setGenerateSOWError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGeneratingSOW(false);
    }
  };

  // If no sections, show start options
  if (!hasContent && !showTemplateSelector) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-lg">
          <div className="p-4 bg-purple-100 rounded-full inline-flex mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Proposal</h2>
          <p className="text-gray-500 mb-8">
            Describe your project and AI will write a complete, professional SOW — with all sections, quantified SLAs, payment milestones, and your diagrams automatically embedded.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowGenerateSOW(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Generate Full SOW with AI
            </button>
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              <LayoutTemplate className="w-5 h-5" />
              Start from Template
            </button>
          </div>
        </div>

        <GenerateSOWModal
          isOpen={showGenerateSOW}
          onClose={() => { setShowGenerateSOW(false); setGenerateSOWError(''); }}
          onGenerate={handleGenerateFullSOW}
          isGenerating={isGeneratingSOW}
          error={generateSOWError}
        />
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
          onClick={() => setShowGenerateSOW(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Generate SOW
        </button>
        <div className="w-px h-5 bg-gray-200" />
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
      <GenerateSOWModal
        isOpen={showGenerateSOW}
        onClose={() => { setShowGenerateSOW(false); setGenerateSOWError(''); }}
        onGenerate={handleGenerateFullSOW}
        isGenerating={isGeneratingSOW}
        error={generateSOWError}
      />
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
