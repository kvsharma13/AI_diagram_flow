'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BPMNDiagram } from '@/types/project';

interface BPMNAIImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: BPMNDiagram) => void;
}

export default function BPMNAIImportModal({ isOpen, onClose, onImport }: BPMNAIImportModalProps) {
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const generateWithAI = async () => {
    if (!textInput.trim()) { setError('Please enter a process description'); return; }
    setIsGenerating(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textInput, type: 'bpmn' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const result = await response.json();
      const diagram = result.data as BPMNDiagram;
      onImport(diagram);
      setSuccess(true);
      setTimeout(() => { onClose(); setTextInput(''); setSuccess(false); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate BPMN diagram');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"><Sparkles className="w-5 h-5 text-white" /></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Process Flow Generator</h2>
              <p className="text-sm text-gray-500 mt-0.5">Describe your business process</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-600" /></button>
        </div>

        <div className="p-6 space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Describe the business process, e.g.:\n\nOrder processing: Customer places order, payment is verified, if approved the warehouse picks and ships items, otherwise customer is notified of rejection..."
            className="w-full h-64 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /><p className="text-sm text-green-700">Process flow generated successfully!</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={generateWithAI} disabled={isGenerating || !textInput.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 py-2 rounded-lg transition-all">
              {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4" />Generate with AI</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
