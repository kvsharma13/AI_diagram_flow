'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, FileText } from 'lucide-react';

interface GenerateSOWModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  error: string;
}

const EXAMPLE_PROMPT = `Client: Dhanani Group (multi-brand restaurant chain — Wendy's, Popeyes, KFC across 500+ stores)
Project: Oracle Invoice Automation Platform
What we're building: A production-grade AI-powered invoice automation system that reads invoice PDFs and Excel files, extracts line-item data, auto-codes vendors and GL accounts, splits invoices across multiple stores, and posts everything directly into Oracle Fusion — all via a web portal and email intake channel.
Total value: $50,000 USD | Timeline: 18 weeks | Model: Fixed-fee
Team: 2 backend engineers, 1 frontend engineer, 1 QA, 1 solution architect, 1 project manager
Tech: Python, FastAPI, React, Claude AI / GPT-4o for OCR, Oracle Fusion REST APIs, PostgreSQL, AWS
Payment: 4 equal milestones of 25% each (signing, prototype, delivery, go-live)
Key requirements: vendor auto-coding, multi-store splitting, org hierarchy dropdown, Excel import, Oracle PDF capture, dual intake (email + drag-drop), production portal`;

export default function GenerateSOWModal({ isOpen, onClose, onGenerate, isGenerating, error }: GenerateSOWModalProps) {
  const [prompt, setPrompt] = useState('');
  const [showExample, setShowExample] = useState(false);

  if (!isOpen) return null;

  const canGenerate = prompt.trim().length > 30;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Generate Full SOW</h2>
              <p className="text-xs text-gray-500">Describe your project — AI writes the complete document, diagrams auto-embedded</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Describe your project</label>
              <button
                onClick={() => { setShowExample(!showExample); if (!showExample) setPrompt(EXAMPLE_PROMPT); }}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                {showExample ? 'Clear example' : 'See example'}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none leading-relaxed"
              placeholder={`Describe your project naturally — include:
• Client name and what they do
• What you're building and why
• Total contract value and timeline
• Key deliverables / requirements
• Tech stack (if relevant)
• Team size and payment structure

The more context you give, the better the SOW. Your Gantt, RACI, Architecture, and BPMN diagrams will be automatically embedded.`}
            />
            <p className="text-xs text-gray-400 mt-1">{prompt.length} characters — more detail = better output</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-purple-700 mb-2">What gets generated</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                'Document Information & Version History',
                'Key Contacts (Vendor + Client)',
                'Detailed Scope with Client Dependencies',
                'Go-Live Success Criteria + SLAs',
                'Solution Architecture',
                'Project Timeline (Gantt auto-embedded)',
                'Project Team & Allocations',
                'Governance & Responsibilities',
                'Service Level Agreements',
                'IP, Refund & Termination Terms',
                'Commercials & Payment Milestones',
                'Change Control & T&Cs',
              ].map(item => (
                <p key={item} className="text-xs text-purple-600 flex items-start gap-1">
                  <span className="text-purple-400 mt-0.5">✓</span> {item}
                </p>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={isGenerating} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onGenerate(prompt)}
            disabled={!canGenerate || isGenerating}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
          >
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" />Generating full SOW...</>
              : <><Sparkles className="w-4 h-4" />Generate Full SOW</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
