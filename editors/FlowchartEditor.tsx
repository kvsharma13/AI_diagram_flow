'use client';

import { useProjectStore } from '@/store/useProjectStore';
import { Trash2, Plus } from 'lucide-react';
import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowchartStepType } from '@/types/project';

export default function FlowchartEditor() {
  const { project, addStep, updateStep, deleteStep } = useProjectStore();

  if (!project) return null;

  const handleAddStep = () => {
    addStep({
      label: 'New Step',
      type: 'process',
      position: { x: 250, y: 250 },
    });
  };

  const stepTypeColors: Record<FlowchartStepType, string> = {
    start: '#10B981',
    process: '#3B82F6',
    decision: '#F59E0B',
    end: '#EF4444',
  };

  const stepTypeStyles: Record<
    FlowchartStepType,
    { borderRadius?: string; clipPath?: string }
  > = {
    start: { borderRadius: '50px' },
    process: { borderRadius: '8px' },
    decision: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    end: { borderRadius: '50px' },
  };

  // Convert steps to React Flow nodes
  const nodes: Node[] = project.flowchartSteps.map((step) => ({
    id: step.id,
    type: 'default',
    position: step.position,
    data: { label: step.label },
    style: {
      background: stepTypeColors[step.type],
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '600',
      ...stepTypeStyles[step.type],
      minWidth: step.type === 'decision' ? '120px' : '100px',
      minHeight: step.type === 'decision' ? '120px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const edges: Edge[] = [];

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      changes.forEach((change) => {
        if (change.type === 'position' && change.position) {
          updateStep(change.id, { position: change.position });
        }
      });
    },
    [updateStep]
  );

  return (
    <div className="space-y-8">
      {/* Step Cards Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Flowchart Steps</h2>
          <button
            onClick={handleAddStep}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Step
          </button>
        </div>

        <div className="grid gap-4">
          {project.flowchartSteps.map((step) => (
            <div key={step.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Step Label
                    </label>
                    <input
                      type="text"
                      value={step.label}
                      onChange={(e) =>
                        updateStep(step.id, { label: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={step.type}
                      onChange={(e) =>
                        updateStep(step.id, {
                          type: e.target.value as FlowchartStepType,
                        })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="start">Start</option>
                      <option value="process">Process</option>
                      <option value="decision">Decision</option>
                      <option value="end">End</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => deleteStep(step.id)}
                  className="ml-3 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* React Flow Canvas */}
      {project.flowchartSteps.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <h3 className="text-xl font-bold p-6 pb-4">Flowchart Diagram</h3>
          <div style={{ height: '600px' }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const step = project.flowchartSteps.find((s) => s.id === node.id);
                  return step ? stepTypeColors[step.type] : '#999';
                }}
              />
            </ReactFlow>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h4 className="font-semibold mb-3">Step Types</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: stepTypeColors.start }}
            />
            <span className="text-sm">Start (Rounded)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ background: stepTypeColors.process }}
            />
            <span className="text-sm">Process (Rectangle)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4"
              style={{
                background: stepTypeColors.decision,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              }}
            />
            <span className="text-sm">Decision (Diamond)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ background: stepTypeColors.end }}
            />
            <span className="text-sm">End (Rounded)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
