'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
  type: 'gantt' | 'raci';
}

export default function AIImportModal({ isOpen, onClose, onImport, type }: AIImportModalProps) {
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ used: number; remaining: number; limit: number } | null>(null);

  // Fetch AI usage when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchAIUsage();
    }
  }, [isOpen]);

  const fetchAIUsage = async () => {
    try {
      const response = await fetch('/api/ai-usage');
      if (response.ok) {
        const data = await response.json();
        setAiUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI usage:', err);
    }
  };

  if (!isOpen) return null;

  const exampleText = type === 'gantt' ? `Phase 1: Foundation & Planning (Months 1-2)
Month 1: Project Kickoff
- Contract signing & team assembly
- Security clearances
- Kickoff meeting
Deliverables: Project charter, Stakeholder plan

Month 2: Requirements & Design
- Workshops with ministries
- Document workflows
- Finalize architecture
Deliverables: Requirements doc, Architecture doc

Phase 2: Development (Months 3-7)
Month 3: Infrastructure Setup
- AWS setup
- Authentication system
...` : `Task: Requirements Gathering
Stakeholders: PM (Accountable), BA (Responsible), Dev Team (Informed)

Task: Development
Stakeholders: PM (Accountable), Dev Team (Responsible), QA (Consulted)
...`;

  const generateWithAI = async () => {
    if (!textInput.trim()) {
      setError('Please enter project description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Calling backend API...');

      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textInput,
          type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate chart');
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate');
      }

      const parsedJSON = result.data;

      console.log('Generated data:', parsedJSON);

      // Update AI usage display
      if (result.remaining !== undefined) {
        setAiUsage(prev => prev ? { ...prev, remaining: result.remaining, used: prev.limit - result.remaining } : null);
      }

      // Import the generated data
      onImport(parsedJSON);
      setSuccess(true);

      setTimeout(() => {
        onClose();
        setTextInput('');
        setSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('AI generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate. Check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = () => {
    setTextInput(exampleText);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                AI-Powered {type === 'gantt' ? 'Gantt Chart' : 'RACI Matrix'} Generator
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Paste your text and let AI create the chart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* AI Credits Display */}
          {aiUsage && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">AI Generations</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    {aiUsage.remaining}/{aiUsage.limit}
                  </div>
                  <div className="text-xs text-gray-600">remaining this month</div>
                </div>
              </div>
              {aiUsage.remaining === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Limit reached. Resets on the 1st of next month.
                </p>
              )}
            </div>
          )}

          {/* Text Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Project Description <span className="text-red-500">*</span>
              </label>
              <button
                onClick={loadExample}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Paste your project timeline here...\n\nExample:\n${exampleText.substring(0, 200)}...`}
              className="w-full h-96 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Generation Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Success!</h4>
                <p className="text-sm text-green-700">Your {type === 'gantt' ? 'Gantt chart' : 'RACI matrix'} has been generated.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              onClick={generateWithAI}
              disabled={isGenerating || !textInput.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
