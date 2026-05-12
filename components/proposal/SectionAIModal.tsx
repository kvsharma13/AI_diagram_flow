'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProposalSection } from '@/types/project';

interface SectionAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: ProposalSection | null;
  projectContext: {
    projectName: string;
    ganttPhases: string[];
    raciStakeholders: string[];
    architectureInfo: string;
  };
  onGenerate: (sectionId: string, content: string) => void;
}

export default function SectionAIModal({ isOpen, onClose, section, projectContext, onGenerate }: SectionAIModalProps) {
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !section) return null;

  const generateContent = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      const contextText = [
        `Project: ${projectContext.projectName}`,
        projectContext.ganttPhases.length > 0 ? `Timeline Phases: ${projectContext.ganttPhases.join(', ')}` : '',
        projectContext.raciStakeholders.length > 0 ? `Stakeholders: ${projectContext.raciStakeholders.join(', ')}` : '',
        projectContext.architectureInfo ? `Architecture: ${projectContext.architectureInfo}` : '',
        additionalContext ? `Additional context: ${additionalContext}` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput: `Generate content for a "${section.title}" section (type: ${section.type}) of a project proposal.\n\nProject context:\n${contextText}\n\nGenerate professional markdown content for this section. Return only the markdown text, no JSON wrapping.`,
          type: 'proposal_section',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const result = await response.json();
      const content = typeof result.data === 'string' ? result.data : result.data?.content || JSON.stringify(result.data);
      onGenerate(section.id, content);
      setSuccess(true);
      setTimeout(() => { onClose(); setAdditionalContext(''); setSuccess(false); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Generate: {section.title}</h2>
              <p className="text-sm text-gray-500">Uses project context to generate content</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Project Context Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Project Context (auto-detected)</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Project:</strong> {projectContext.projectName}</p>
              {projectContext.ganttPhases.length > 0 && (
                <p><strong>Phases:</strong> {projectContext.ganttPhases.join(', ')}</p>
              )}
              {projectContext.raciStakeholders.length > 0 && (
                <p><strong>Stakeholders:</strong> {projectContext.raciStakeholders.join(', ')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Additional Context (optional)</label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add any specific details or requirements for this section..."
              className="mt-1 w-full h-24 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Content generated successfully!</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={generateContent}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-2 rounded-lg transition-all"
            >
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
