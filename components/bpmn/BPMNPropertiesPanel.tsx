'use client';

import { X, Trash2 } from 'lucide-react';
import { BPMNNode, BPMNEdge, BPMNSwimlane } from '@/types/project';

interface BPMNPropertiesPanelProps {
  selectedNode?: BPMNNode | null;
  selectedEdge?: BPMNEdge | null;
  selectedSwimlane?: BPMNSwimlane | null;
  swimlanes: BPMNSwimlane[];
  onUpdateNode: (id: string, updates: Partial<BPMNNode>) => void;
  onUpdateEdge: (id: string, updates: Partial<BPMNEdge>) => void;
  onUpdateSwimlane: (id: string, updates: Partial<BPMNSwimlane>) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDeleteSwimlane: (id: string) => void;
  onClose: () => void;
}

export default function BPMNPropertiesPanel({
  selectedNode, selectedEdge, selectedSwimlane, swimlanes,
  onUpdateNode, onUpdateEdge, onUpdateSwimlane,
  onDeleteNode, onDeleteEdge, onDeleteSwimlane, onClose,
}: BPMNPropertiesPanelProps) {
  if (!selectedNode && !selectedEdge && !selectedSwimlane) return null;

  return (
    <div className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-800">Properties</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4 text-gray-500" /></button>
      </div>

      <div className="p-4 space-y-4">
        {selectedNode && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Label</label>
              <input
                type="text" value={selectedNode.label}
                onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
              <textarea
                value={selectedNode.description || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { description: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            {(selectedNode.type === 'task' || selectedNode.type === 'userTask' || selectedNode.type === 'serviceTask' || selectedNode.type === 'scriptTask') && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Assignee</label>
                  <select
                    value={selectedNode.assignee || ''}
                    onChange={(e) => onUpdateNode(selectedNode.id, { assignee: e.target.value || undefined })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {swimlanes.map((s) => (
                      <option key={s.id} value={s.role}>{s.role || s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Swimlane</label>
                  <select
                    value={selectedNode.swimlaneId || ''}
                    onChange={(e) => onUpdateNode(selectedNode.id, { swimlaneId: e.target.value || undefined })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {swimlanes.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">{selectedNode.type}</div>
            </div>
            <button onClick={() => onDeleteNode(selectedNode.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              <Trash2 className="w-4 h-4" /> Delete Node
            </button>
          </>
        )}

        {selectedEdge && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Label</label>
              <input
                type="text" value={selectedEdge.label || ''}
                onChange={(e) => onUpdateEdge(selectedEdge.id, { label: e.target.value || undefined })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Condition</label>
              <input
                type="text" value={selectedEdge.conditionExpression || ''}
                onChange={(e) => onUpdateEdge(selectedEdge.id, { conditionExpression: e.target.value || undefined })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., amount > 1000"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">{selectedEdge.type}</div>
            </div>
            <button onClick={() => onDeleteEdge(selectedEdge.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              <Trash2 className="w-4 h-4" /> Delete Edge
            </button>
          </>
        )}

        {selectedSwimlane && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Label</label>
              <input
                type="text" value={selectedSwimlane.label}
                onChange={(e) => onUpdateSwimlane(selectedSwimlane.id, { label: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
              <input
                type="text" value={selectedSwimlane.role}
                onChange={(e) => onUpdateSwimlane(selectedSwimlane.id, { role: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">Color</label>
              <input
                type="color" value={selectedSwimlane.color || '#6366f1'}
                onChange={(e) => onUpdateSwimlane(selectedSwimlane.id, { color: e.target.value })}
                className="mt-1 w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <button onClick={() => onDeleteSwimlane(selectedSwimlane.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
              <Trash2 className="w-4 h-4" /> Delete Swimlane
            </button>
          </>
        )}
      </div>
    </div>
  );
}
