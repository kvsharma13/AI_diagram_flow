'use client';

import { X, FileText, Briefcase, Target, Code, Mail, File } from 'lucide-react';
import { proposalTemplates } from '@/lib/proposalTemplates';
import { ProposalTemplateId } from '@/types/project';

interface ProposalTemplateSelectorProps {
  onSelect: (templateId: ProposalTemplateId) => void;
  onClose: () => void;
}

const templateIcons: Record<string, any> = {
  sow: Briefcase,
  brd: FileText,
  project_charter: Target,
  technical_proposal: Code,
  rfp_response: Mail,
  blank: File,
};

export default function ProposalTemplateSelector({ onSelect, onClose }: ProposalTemplateSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Choose a Template</h2>
            <p className="text-sm text-gray-500 mt-0.5">Start with a pre-built template or blank document</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {proposalTemplates.map((template) => {
              const Icon = templateIcons[template.id] || FileText;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template.id)}
                  className="flex flex-col items-start p-5 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left group"
                >
                  <div className="p-2.5 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200 transition-colors">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
                  {template.sections.length > 0 && (
                    <span className="text-xs text-purple-600 mt-2 font-medium">
                      {template.sections.length} sections
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
