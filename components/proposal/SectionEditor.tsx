'use client';

import { useState, useEffect } from 'react';
import { Eye, Edit3, Camera, Sparkles, Trash2, EyeOff, PlusCircle } from 'lucide-react';
import { ProposalSection } from '@/types/project';
import { renderProjectDiagram } from '@/lib/proposal/renderDiagram';
import { useProjectStore } from '@/store/useProjectStore';
import {
  parseTokens,
  assignUIDs,
  DiagramToken,
  DiagramSlotData,
  getTypeLabel,
  getTypeColor,
} from '@/lib/proposal/diagramTokens';
import DiagramSlotModal from './DiagramSlotModal';

interface SectionEditorProps {
  section: ProposalSection;
  onUpdate: (id: string, updates: Partial<ProposalSection>) => void;
  onDelete: (id: string) => void;
  onSnapshot: (sectionId: string, snapshot: string) => void;
  onAIGenerate: (section: ProposalSection) => void;
}

// Section type -> a project diagram we can render from STORED DATA (no live DOM,
// so it works even though those editors aren't mounted on the Proposal tab).
const diagramTypeMap: Record<string, string> = {
  timeline: 'gantt',
  architecture: 'architecture',
};

// Colour map for slot badges
const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   dot: 'bg-pink-500' },
  gray:   { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-200',   dot: 'bg-gray-400' },
};

function getDiagrams(section: ProposalSection): Record<string, DiagramSlotData> {
  return (section.metadata?.diagrams as Record<string, DiagramSlotData>) || {};
}

export default function SectionEditor({ section, onUpdate, onDelete, onSnapshot, onAIGenerate }: SectionEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeSlotUid, setActiveSlotUid] = useState<string | null>(null);

  const diagramType = diagramTypeMap[section.type];
  const diagrams = getDiagrams(section);

  // Auto-assign UIDs to any tokens that don't have them yet
  useEffect(() => {
    const processed = assignUIDs(section.content);
    if (processed !== section.content) {
      onUpdate(section.id, { content: processed });
    }
  }, []);

  const tokens = parseTokens(section.content);
  const activeToken = tokens.find(t => t.uid === activeSlotUid) ?? null;

  const handleCapture = async () => {
    if (!diagramType) return;
    setIsCapturing(true);
    try {
      const project = useProjectStore.getState().project;
      const snapshot = project ? await renderProjectDiagram(diagramType, project) : null;
      if (snapshot) onSnapshot(section.id, snapshot);
      else
        alert(
          diagramType === 'gantt'
            ? 'No Gantt phases found yet. Add phases in the Gantt Chart module first.'
            : 'No architecture diagram found yet. Build one in the Architecture module first.'
        );
    } catch (e) {
      console.error('Render failed:', e);
      alert('Could not render the diagram from project data.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleInsertDiagram = (uid: string, data: DiagramSlotData) => {
    onUpdate(section.id, {
      metadata: {
        ...section.metadata,
        diagrams: { ...diagrams, [uid]: data },
      },
    });
    setActiveSlotUid(null);
  };

  const handleContentChange = (value: string) => {
    const processed = assignUIDs(value);
    onUpdate(section.id, { content: processed });
  };

  // Render content for preview mode — handles {{DIAGRAM:...}} tokens inline
  const renderPreview = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Check if entire line is a diagram token
      const tokenMatch = line.trim().match(/^\{\{DIAGRAM:(\w+):([a-z0-9]{8}):([^}]+)\}\}$/);
      if (tokenMatch) {
        const uid = tokenMatch[2];
        const label = tokenMatch[3].trim();
        const type = tokenMatch[1];
        const slotData = diagrams[uid];
        const color = colorMap[getTypeColor(type as any)] ?? colorMap.gray;

        if (slotData?.snapshot) {
          elements.push(
            <div key={i} className="my-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className={`px-4 py-2 flex items-center justify-between ${color.bg} border-b ${color.border}`}>
                <span className={`text-xs font-semibold ${color.text}`}>{label}</span>
                <button
                  onClick={() => setActiveSlotUid(uid)}
                  className={`text-xs ${color.text} opacity-70 hover:opacity-100`}
                >
                  Replace
                </button>
              </div>
              <img src={slotData.snapshot} alt={label} className="w-full" />
            </div>
          );
        } else {
          elements.push(
            <button
              key={i}
              onClick={() => setActiveSlotUid(uid)}
              className={`my-4 w-full flex items-center gap-3 px-5 py-4 rounded-xl border-2 border-dashed ${color.border} ${color.bg} hover:opacity-80 transition-opacity text-left`}
            >
              <div className={`w-2 h-2 rounded-full ${color.dot} flex-shrink-0`} />
              <div>
                <p className={`text-sm font-semibold ${color.text}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(type as any)} — Click to create</p>
              </div>
            </button>
          );
        }
        return;
      }

      // Standard markdown rendering
      if (line.startsWith('## '))
        elements.push(<h2 key={i} className="text-xl font-bold text-gray-900 mt-6 mb-2">{line.slice(3)}</h2>);
      else if (line.startsWith('### '))
        elements.push(<h3 key={i} className="text-lg font-semibold text-gray-800 mt-4 mb-1">{line.slice(4)}</h3>);
      else if (line.startsWith('#### '))
        elements.push(<h4 key={i} className="text-base font-semibold text-gray-700 mt-3 mb-1">{line.slice(5)}</h4>);
      else if (line.startsWith('- '))
        elements.push(<li key={i} className="text-gray-700 ml-4 list-disc">{line.slice(2)}</li>);
      else if (line.match(/^\d+\.\s/))
        elements.push(<li key={i} className="text-gray-700 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
      else if (line.includes('|') && !line.match(/^[\s|:-]+$/)) {
        const cells = line.split('|').filter(Boolean).map(c => c.trim());
        elements.push(
          <div key={i} className="flex border-b border-gray-200 even:bg-gray-50">
            {cells.map((cell, j) => (
              <div key={j} className="flex-1 px-3 py-2 text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>
        );
      } else if (line.trim() === '')
        elements.push(<div key={i} className="h-2" />);
      else
        elements.push(<p key={i} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />);
    });

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <input
          type="text"
          value={section.title}
          onChange={e => onUpdate(section.id, { title: e.target.value })}
          className="text-lg font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
        />
        <div className="flex items-center gap-2">
          {diagramType && (
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
          <button onClick={() => onDelete(section.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
          <>
            <textarea
              value={section.content}
              onChange={e => handleContentChange(e.target.value)}
              className="w-full min-h-[360px] px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              placeholder="Write your section content in Markdown. Use {{DIAGRAM:architecture:Label}} to insert a diagram placeholder."
            />

            {/* Diagram Slots Panel */}
            {tokens.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600">
                    Diagram Placeholders ({tokens.length})
                  </p>
                  <p className="text-xs text-gray-400">Click to create or replace each diagram</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {tokens.map(token => {
                    const slotData = diagrams[token.uid];
                    const color = colorMap[getTypeColor(token.type)] ?? colorMap.gray;
                    return (
                      <div key={token.uid} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${slotData?.snapshot ? 'bg-green-500' : color.dot}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{token.label}</p>
                            <p className="text-xs text-gray-400">{getTypeLabel(token.type)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {slotData?.snapshot && (
                            <span className="text-xs text-green-600 font-medium">Created ✓</span>
                          )}
                          <button
                            onClick={() => setActiveSlotUid(token.uid)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              slotData?.snapshot
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : `${color.bg} ${color.text} hover:opacity-80`
                            }`}
                          >
                            <PlusCircle className="w-3 h-3" />
                            {slotData?.snapshot ? 'Replace' : 'Create'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {section.diagramSnapshot && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Attached Diagram</span>
                  <button onClick={() => onSnapshot(section.id, '')} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                </div>
                <img src={section.diagramSnapshot} alt="Diagram" className="w-full" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Diagram Slot Modal */}
      {activeToken && (
        <DiagramSlotModal
          isOpen={!!activeSlotUid}
          onClose={() => setActiveSlotUid(null)}
          token={activeToken}
          existingData={diagrams[activeToken.uid] ?? null}
          onInsert={handleInsertDiagram}
        />
      )}
    </div>
  );
}
