'use client';

import { useState } from 'react';
import { Eye, Edit3, Camera, Sparkles, Trash2, EyeOff } from 'lucide-react';
import { ProposalSection } from '@/types/project';
import { captureDiagramSnapshot } from '@/lib/proposal/diagramSnapshot';

interface SectionEditorProps {
  section: ProposalSection;
  onUpdate: (id: string, updates: Partial<ProposalSection>) => void;
  onDelete: (id: string) => void;
  onSnapshot: (sectionId: string, snapshot: string) => void;
  onAIGenerate: (section: ProposalSection) => void;
}

const diagramSourceMap: Record<string, string> = {
  timeline: 'gantt-export-area',
  stakeholders: 'raci-export-area',
  architecture: 'architecture-export-area',
  bpmn_process: 'bpmn-export-area',
};

export default function SectionEditor({ section, onUpdate, onDelete, onSnapshot, onAIGenerate }: SectionEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const diagramSource = diagramSourceMap[section.type];

  const handleCapture = async () => {
    if (!diagramSource) return;
    setIsCapturing(true);
    try {
      const snapshot = await captureDiagramSnapshot(diagramSource);
      if (snapshot) {
        onSnapshot(section.id, snapshot);
      } else {
        alert('Could not capture diagram. Make sure the corresponding editor tab has content.');
      }
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const renderPreview = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{line.replace('## ', '')}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-3 mb-1">{line.replace('### ', '')}</h3>;
      if (line.startsWith('- ')) return <li key={i} className="text-gray-700 ml-4 list-disc">{line.replace('- ', '')}</li>;
      if (line.match(/^\d+\.\s/)) return <li key={i} className="text-gray-700 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>;
      if (line.includes('|') && !line.match(/^[\s-:|]+$/)) {
        const cells = line.split('|').filter(Boolean).map(c => c.trim());
        return (
          <div key={i} className="flex border-b border-gray-200">
            {cells.map((cell, j) => (
              <div key={j} className="flex-1 px-3 py-1.5 text-sm text-gray-700">{cell.replace(/\*\*/g, '')}</div>
            ))}
          </div>
        );
      }
      if (line.trim() === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-gray-700 leading-relaxed">{line.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate(section.id, { title: e.target.value })}
          className="text-lg font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
        />
        <div className="flex items-center gap-2">
          {diagramSource && (
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              {isCapturing ? 'Capturing...' : 'Insert from Project'}
            </button>
          )}
          <button
            onClick={() => onAIGenerate(section)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isPreview ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isPreview ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {isPreview ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={() => onUpdate(section.id, { isVisible: !section.isVisible })}
            className={`p-1.5 rounded-lg transition-colors ${section.isVisible ? 'text-gray-400 hover:bg-gray-100' : 'text-red-400 bg-red-50'}`}
            title={section.isVisible ? 'Visible in export' : 'Hidden from export'}
          >
            {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isPreview ? (
          <div className="prose max-w-none">
            {renderPreview(section.content)}
            {section.diagramSnapshot && (
              <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                <img src={section.diagramSnapshot} alt="Diagram" className="w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              value={section.content}
              onChange={(e) => onUpdate(section.id, { content: e.target.value })}
              className="w-full min-h-[400px] px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              placeholder="Write your section content in Markdown..."
            />
            {section.diagramSnapshot && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Attached Diagram</span>
                  <button
                    onClick={() => onSnapshot(section.id, '')}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <img src={section.diagramSnapshot} alt="Diagram" className="w-full" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
