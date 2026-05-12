'use client';

import { useState } from 'react';
import { Play, Square, Clock, User, Settings, Code, ClipboardList, GitFork, Plus, Minus, Circle, Database, FileText, Layers } from 'lucide-react';
import { BPMNNodeType } from '@/types/project';

interface BPMNToolbarProps {
  onAddNode: (type: BPMNNodeType) => void;
  onAddSwimlane: () => void;
}

const toolbarSections = [
  {
    label: 'Events',
    items: [
      { type: 'startEvent' as BPMNNodeType, icon: Play, label: 'Start', color: 'text-green-500' },
      { type: 'endEvent' as BPMNNodeType, icon: Square, label: 'End', color: 'text-red-500' },
      { type: 'intermediateEvent' as BPMNNodeType, icon: Clock, label: 'Timer', color: 'text-yellow-500' },
    ],
  },
  {
    label: 'Tasks',
    items: [
      { type: 'task' as BPMNNodeType, icon: ClipboardList, label: 'Task', color: 'text-blue-500' },
      { type: 'userTask' as BPMNNodeType, icon: User, label: 'User Task', color: 'text-blue-500' },
      { type: 'serviceTask' as BPMNNodeType, icon: Settings, label: 'Service', color: 'text-blue-500' },
      { type: 'scriptTask' as BPMNNodeType, icon: Code, label: 'Script', color: 'text-blue-500' },
    ],
  },
  {
    label: 'Gateways',
    items: [
      { type: 'exclusiveGateway' as BPMNNodeType, icon: GitFork, label: 'XOR', color: 'text-amber-500' },
      { type: 'parallelGateway' as BPMNNodeType, icon: Plus, label: 'AND', color: 'text-amber-500' },
      { type: 'inclusiveGateway' as BPMNNodeType, icon: Circle, label: 'OR', color: 'text-amber-500' },
    ],
  },
  {
    label: 'Data',
    items: [
      { type: 'dataObject' as BPMNNodeType, icon: FileText, label: 'Data', color: 'text-gray-500' },
      { type: 'dataStore' as BPMNNodeType, icon: Database, label: 'Store', color: 'text-gray-500' },
    ],
  },
];

export default function BPMNToolbar({ onAddNode, onAddSwimlane }: BPMNToolbarProps) {
  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 overflow-y-auto">
      {toolbarSections.map((section) => (
        <div key={section.label} className="w-full px-1">
          <div className="text-[8px] font-semibold text-gray-400 uppercase text-center mb-1 mt-2">{section.label}</div>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onAddNode(item.type)}
                className="w-full flex flex-col items-center gap-0.5 py-1.5 px-1 rounded hover:bg-gray-100 transition-colors group"
                title={item.label}
              >
                <Icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[9px] text-gray-500 leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
      <div className="w-full px-1 mt-2">
        <div className="text-[8px] font-semibold text-gray-400 uppercase text-center mb-1">Structure</div>
        <button
          onClick={onAddSwimlane}
          className="w-full flex flex-col items-center gap-0.5 py-1.5 px-1 rounded hover:bg-gray-100 transition-colors group"
          title="Swimlane"
        >
          <Layers className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] text-gray-500 leading-tight">Lane</span>
        </button>
        <button
          onClick={() => onAddNode('subProcess')}
          className="w-full flex flex-col items-center gap-0.5 py-1.5 px-1 rounded hover:bg-gray-100 transition-colors group"
          title="Sub-Process"
        >
          <Minus className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] text-gray-500 leading-tight">Sub</span>
        </button>
      </div>
    </div>
  );
}
