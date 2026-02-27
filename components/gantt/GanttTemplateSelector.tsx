'use client';

import { useState } from 'react';
import { ganttTemplates, templateCategories, GanttTemplate } from '@/lib/ganttTemplates';
import { X, Sparkles, Check, Calendar, Layers } from 'lucide-react';
import { PhaseColor } from '@/types/project';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: GanttTemplate) => void;
}

export default function GanttTemplateSelector({ isOpen, onClose, onSelectTemplate }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<GanttTemplate | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory === 'All'
    ? ganttTemplates
    : ganttTemplates.filter(t => t.category === selectedCategory);

  const colorConfig: Record<PhaseColor, string> = {
    purple: '#8B5CF6',
    blue: '#3B82F6',
    green: '#10B981',
    orange: '#F59E0B',
    pink: '#EC4899',
    teal: '#14B8A6',
    red: '#EF4444',
    indigo: '#6366F1',
    yellow: '#EAB308',
    cyan: '#06B6D4',
  };

  const handleSelectTemplate = (template: GanttTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
              <p className="text-blue-100 text-sm mt-0.5">Start with a professional timeline template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Templates
            </button>
            {templateCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`group bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-600 shadow-lg shadow-blue-200'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                {/* Preview Style Gradient */}
                <div
                  className="relative h-32 overflow-hidden"
                  style={{ background: template.preview }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Mini Timeline Bars */}
                  <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
                    {template.phases.slice(0, 4).map((phase, idx) => {
                      const startPercent = ((phase.startMonth - 1) / template.timelineMonths) * 100;
                      const widthPercent = (phase.duration / template.timelineMonths) * 100;
                      return (
                        <div
                          key={idx}
                          className="h-2 rounded-full shadow-lg backdrop-blur-sm"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            marginLeft: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            maxWidth: `${100 - startPercent}%`,
                          }}
                        />
                      );
                    })}
                  </div>

                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-5 h-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{template.icon}</span>
                    <h3 className="font-bold text-gray-900 flex-1">{template.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{template.phases.length} phases</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{template.timelineMonths}M timeline</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <span className="font-medium text-gray-900">
                Selected: <span className="text-blue-600">{selectedTemplate.name}</span>
              </span>
            ) : (
              <span>Select a template to get started</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedTemplate && handleSelectTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed shadow-lg shadow-blue-200 disabled:shadow-none flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
