'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SquareUser, User, Circle, Square, LayoutGrid } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { ToolbarButton } from '@/components/ui/ba-controls';
import DiagramCanvas from '@/components/ba/diagram/DiagramCanvas';
import { useCaseNodeTypes } from '@/components/ba/diagram/usecase/nodes';
import { useCaseEdgeTypes } from '@/components/ba/diagram/usecase/edges';
import { applyDiagramLayout } from '@/lib/ba/diagram/elkLayout';
import type { DiagramNode, DiagramEdge } from '@/types/project';

const getSize = (n: DiagramNode) =>
  n.type === 'actor' ? { width: 80, height: 92 } : { width: 140, height: 64 };

export default function UseCaseEditor() {
  const { project, setUseCaseDiagram } = useProjectStore();
  const [busy, setBusy] = useState(false);
  if (!project) return null;

  const diagram = project.useCaseDiagram || { nodes: [], edges: [] };
  const setNodes = (nodes: DiagramNode[]) => setUseCaseDiagram({ ...diagram, nodes });
  const setEdges = (edges: DiagramEdge[]) => setUseCaseDiagram({ ...diagram, edges });

  const add = (type: 'actor' | 'useCase' | 'boundary') => {
    const base = { id: uuidv4(), type, position: { x: 140 + Math.random() * 260, y: 90 + Math.random() * 180 } };
    const node: DiagramNode =
      type === 'boundary'
        ? { ...base, width: 380, height: 260, data: { label: 'System', container: true } }
        : { ...base, data: { label: type === 'actor' ? 'Actor' : 'Use case' } };
    setUseCaseDiagram({ ...diagram, nodes: [...diagram.nodes, node] });
  };

  const makeEdge = (source: string, target: string): DiagramEdge => ({
    id: `e-${source}-${target}-${uuidv4().slice(0, 6)}`,
    type: 'usecase',
    source,
    target,
    data: { kind: 'association' },
  });

  const autoLayout = async () => {
    const movable = diagram.nodes.filter((n) => !n.data?.container);
    if (!movable.length) return;
    setBusy(true);
    try {
      const laid = await applyDiagramLayout(movable, diagram.edges, getSize, 'RIGHT');
      const map = new Map(laid.map((n) => [n.id, n]));
      setNodes(diagram.nodes.map((n) => map.get(n.id) || n));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModuleShell
      id="usecase-export-area"
      exportModuleId="useCase"
      title="Use-Case Diagram"
      subtitle={`${diagram.nodes.length} node${diagram.nodes.length === 1 ? '' : 's'} · ${diagram.edges.length} relationship${diagram.edges.length === 1 ? '' : 's'}`}
      icon={SquareUser}
      bodyClassName="overflow-hidden p-0"
      actions={
        <>
          <ToolbarButton icon={User} onClick={() => add('actor')}>Actor</ToolbarButton>
          <ToolbarButton icon={Circle} onClick={() => add('useCase')}>Use Case</ToolbarButton>
          <ToolbarButton icon={Square} onClick={() => add('boundary')}>Boundary</ToolbarButton>
          <ToolbarButton icon={LayoutGrid} onClick={autoLayout} disabled={busy}>{busy ? 'Laying out…' : 'Auto-Layout'}</ToolbarButton>
        </>
      }
    >
      <div className="relative h-full w-full">
        <DiagramCanvas
          nodes={diagram.nodes}
          edges={diagram.edges}
          nodeTypes={useCaseNodeTypes}
          edgeTypes={useCaseEdgeTypes}
          makeEdge={makeEdge}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
        {diagram.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6 py-5 rounded-xl pointer-events-none" style={{ background: 'rgba(17,19,24,0.75)', border: '1px solid var(--border)' }}>
              <SquareUser className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Build a use-case diagram</p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Add an <b>Actor</b> and a <b>Use Case</b>, then drag from a node handle to connect them. Select an edge to set «include», «extend», or generalization.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
