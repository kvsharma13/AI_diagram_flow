import { Node, Edge, Layer } from '@/types/architecture';

export function generateMermaidFromApplication(
  nodes: Node[],
  edges: Edge[],
  layers: Layer[]
): string {
  let mermaid = 'graph TB\n\n';

  // Group nodes by layer
  const nodesByLayer = nodes.reduce((acc, node) => {
    const layerId = node.layerId || 'unlayered';
    if (!acc[layerId]) acc[layerId] = [];
    acc[layerId].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  // Generate subgraphs for each layer
  layers.forEach((layer) => {
    const layerNodes = nodesByLayer[layer.id] || [];
    if (layerNodes.length > 0) {
      mermaid += `subgraph "${layer.name}"\n`;
      layerNodes.forEach((node) => {
        mermaid += `  ${node.id}[${node.label}]\n`;
      });
      mermaid += 'end\n\n';
    }
  });

  // Add unlayered nodes
  const unlayered = nodesByLayer['unlayered'] || [];
  unlayered.forEach((node) => {
    mermaid += `${node.id}[${node.label}]\n`;
  });

  if (unlayered.length > 0) mermaid += '\n';

  // Add edges
  edges.forEach((edge) => {
    const arrow = edge.animated ? '==>' : '-->';
    mermaid += `${edge.source} ${arrow} ${edge.target}\n`;
  });

  // Add styling
  mermaid += '\n';
  layers.forEach((layer, index) => {
    const colors = ['#61DAFB', '#68A063', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981'];
    const color = layer.color || colors[index % colors.length];
    mermaid += `style ${layer.id} fill:${color},stroke:#000,stroke-width:2px\n`;
  });

  return mermaid;
}

export function parseMermaidToNodes(mermaidCode: string): {
  nodes: Node[];
  edges: Edge[];
  layers: Layer[];
} {
  // Simple parser - can be enhanced
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const layers: Layer[] = [];

  const lines = mermaidCode.split('\n');
  let currentLayer: string | null = null;
  let yOffset = 100;

  lines.forEach((line) => {
    line = line.trim();

    // Parse subgraph (layer)
    if (line.startsWith('subgraph')) {
      const match = line.match(/subgraph\s+"([^"]+)"/);
      if (match) {
        const layerName = match[1];
        const layerId = layerName.toLowerCase().replace(/\s+/g, '-');
        layers.push({ id: layerId, name: layerName });
        currentLayer = layerId;
      }
    } else if (line === 'end') {
      currentLayer = null;
      yOffset += 200;
    }
    // Parse node
    else if (line.includes('[') && line.includes(']')) {
      const match = line.match(/(\w+)\[([^\]]+)\]/);
      if (match) {
        const [, id, label] = match;
        nodes.push({
          id,
          label,
          type: 'default',
          layerId: currentLayer || undefined,
          position: { x: 200 + Math.random() * 400, y: yOffset },
        });
      }
    }
    // Parse edge
    else if (line.includes('-->') || line.includes('==>')) {
      const match = line.match(/(\w+)\s+(-->|==>)\s+(\w+)/);
      if (match) {
        const [, source, arrow, target] = match;
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          animated: arrow === '==>',
        });
      }
    }
  });

  return { nodes, edges, layers };
}
