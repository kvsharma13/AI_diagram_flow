'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Plus, FileText, Briefcase, Target, Clock, Users, Network, Workflow, AlertTriangle, DollarSign, CheckCircle, ListChecks, Scale, Paperclip, Edit3 } from 'lucide-react';
import { ProposalSection, ProposalSectionType } from '@/types/project';

const sectionIcons: Record<string, any> = {
  cover: FileText,
  executive_summary: Briefcase,
  scope: Target,
  timeline: Clock,
  stakeholders: Users,
  architecture: Network,
  bpmn_process: Workflow,
  risks: AlertTriangle,
  budget: DollarSign,
  assumptions: CheckCircle,
  deliverables: ListChecks,
  terms: Scale,
  appendix: Paperclip,
  custom: Edit3,
};

interface SortableItemProps {
  section: ProposalSection;
  isActive: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

function SortableItem({ section, isActive, onClick, onToggleVisibility, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const Icon = sectionIcons[section.type] || FileText;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
        isActive ? 'bg-purple-100 border border-purple-300' : 'hover:bg-gray-100 border border-transparent'
      }`}
      onClick={onClick}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5">
        <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
      </div>
      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
      <span className={`text-sm truncate flex-1 ${isActive ? 'font-medium text-purple-900' : 'text-gray-700'} ${!section.isVisible ? 'opacity-50' : ''}`}>
        {section.title}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title={section.isVisible ? 'Hide' : 'Show'}
        >
          {section.isVisible ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-red-400" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 rounded hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface SectionListProps {
  sections: ProposalSection[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
  onReorder: (sections: ProposalSection[]) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSection: (type: ProposalSectionType) => void;
}

const addSectionOptions: Array<{ type: ProposalSectionType; label: string }> = [
  { type: 'custom', label: 'Custom Section' },
  { type: 'executive_summary', label: 'Executive Summary' },
  { type: 'scope', label: 'Scope' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'stakeholders', label: 'Stakeholders' },
  { type: 'architecture', label: 'Architecture' },
  { type: 'bpmn_process', label: 'Process Flow' },
  { type: 'risks', label: 'Risks' },
  { type: 'budget', label: 'Budget' },
  { type: 'deliverables', label: 'Deliverables' },
  { type: 'assumptions', label: 'Assumptions' },
  { type: 'terms', label: 'Terms' },
  { type: 'appendix', label: 'Appendix' },
];

export default function SectionList({ sections, activeSection, onSelectSection, onReorder, onToggleVisibility, onDelete, onAddSection }: SectionListProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
      onReorder(reordered);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-800">Sections</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {sections.sort((a, b) => a.order - b.order).map((section) => (
              <SortableItem
                key={section.id}
                section={section}
                isActive={activeSection === section.id}
                onClick={() => onSelectSection(section.id)}
                onToggleVisibility={() => onToggleVisibility(section.id)}
                onDelete={() => onDelete(section.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add Section */}
      <div className="p-2 border-t border-gray-200 relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
        {showAddMenu && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto z-10">
            {addSectionOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => { onAddSection(option.type); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
