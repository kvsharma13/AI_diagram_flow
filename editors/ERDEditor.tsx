'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Database, Plus, LayoutGrid } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import ModuleShell from '@/components/ba/ModuleShell';
import { ToolbarButton } from '@/components/ui/ba-controls';
import DiagramCanvas from '@/components/ba/diagram/DiagramCanvas';
import { erdNodeTypes } from '@/components/ba/diagram/erd/nodes';
import { erdEdgeTypes } from '@/components/ba/diagram/erd/edges';
import { applyDiagramLayout } from '@/lib/ba/diagram/elkLayout';
import type { DiagramNode, DiagramEdge } from '@/types/project';

const getSize = (n: DiagramNode) => {
  const rows = (n.data?.attributes?.length || 0);
  return { width: 200, height: 40 + rows * 22 + 24 };
};

export default function ERDEditor() {
  const { project, setErd } = useProjectStore();
  const [busy, setBusy] = useState(false);
  if (!project) return null;

  const diagram = project.erd || { nodes: [], edges: [] };
  const setNodes = (nodes: DiagramNode[]) => setErd({ ...diagram, nodes });
  const setEdges = (edges: DiagramEdge[]) => setErd({ ...diagram, edges });

  const addEntity = (weak: boolean) => {
    const node: DiagramNode = {
      id: uuidv4(),
      type: weak ? 'weakEntity' : 'entity',
      position: { x: 140 + Math.random() * 280, y: 90 + Math.random() * 200 },
      data: {
        label: weak ? 'Weak Entity' : 'Entity',
        weak,
        attributes: [{ id: uuidv4(), name: 'id', dataType: 'uuid', key: 'PK' }],
      },
    };
    setErd({ ...diagram, nodes: [...diagram.nodes, node] });
  };

  const makeEdge = (source: string, target: string): DiagramEdge => ({
    id: `e-${source}-${target}-${uuidv4().slice(0, 6)}`,
    type: 'erd',
    source,
    target,
    data: { cardinality: '1:N' },
  });

  const autoLayout = async () => {
    if (!diagram.nodes.length) return;
    setBusy(true);
    try {
      setNodes(await applyDiagramLayout(diagram.nodes, diagram.edges, getSize, 'RIGHT'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModuleShell
      id="erd-export-area"
      exportModuleId="erd"
      title="ERD / Data Model"
      subtitle={`${diagram.nodes.length} entit${diagram.nodes.length === 1 ? 'y' : 'ies'} · ${diagram.edges.length} relationship${diagram.edges.length === 1 ? '' : 's'}`}
      icon={Database}
      bodyClassName="overflow-hidden p-0"
      actions={
        <>
          <ToolbarButton icon={Plus} onClick={() => addEntity(false)}>Entity</ToolbarButton>
          <ToolbarButton icon={Plus} onClick={() => addEntity(true)}>Weak Entity</ToolbarButton>
          <ToolbarButton icon={LayoutGrid} onClick={autoLayout} disabled={busy}>{busy ? 'Laying out…' : 'Auto-Layout'}</ToolbarButton>
        </>
      }
    >
      <div className="relative h-full w-full">
        <DiagramCanvas
          nodes={diagram.nodes}
          edges={diagram.edges}
          nodeTypes={erdNodeTypes}
          edgeTypes={erdEdgeTypes}
          makeEdge={makeEdge}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
        />
        {diagram.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6 py-5 rounded-xl" style={{ background: 'rgba(17,19,24,0.75)', border: '1px solid var(--border)' }}>
              <Database className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Model your data</p>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-secondary)' }}>
                Add an <b>Entity</b>, edit its attributes (PK / FK / derived) inline, then drag between entities to relate them. Select a relationship to set 1:1, 1:N, or M:N.
              </p>
            </div>
          </div>
        )}
      </div>
    </ModuleShell>
  );
}
