import { BPMNNode, BPMNEdge, BPMNSwimlane, BPMNDiagram, BPMNNodeType } from '@/types/project';
import { v4 as uuidv4 } from 'uuid';

export function parseBPMNXml(xml: string): BPMNDiagram {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const nodes: BPMNNode[] = [];
  const edges: BPMNEdge[] = [];
  const swimlanes: BPMNSwimlane[] = [];

  const ns = 'http://www.omg.org/spec/BPMN/20100524/MODEL';

  // Parse lanes
  const laneElements = doc.getElementsByTagNameNS(ns, 'lane');
  for (let i = 0; i < laneElements.length; i++) {
    const lane = laneElements[i];
    swimlanes.push({
      id: lane.getAttribute('id') || uuidv4(),
      label: lane.getAttribute('name') || `Lane ${i + 1}`,
      role: lane.getAttribute('name') || '',
      order: i,
    });
  }

  // Parse nodes
  const typeMap: Record<string, BPMNNodeType> = {
    startEvent: 'startEvent',
    endEvent: 'endEvent',
    task: 'task',
    userTask: 'userTask',
    serviceTask: 'serviceTask',
    scriptTask: 'scriptTask',
    exclusiveGateway: 'exclusiveGateway',
    parallelGateway: 'parallelGateway',
    inclusiveGateway: 'inclusiveGateway',
    subProcess: 'subProcess',
    intermediateCatchEvent: 'intermediateEvent',
    intermediateThrowEvent: 'intermediateEvent',
    dataObjectReference: 'dataObject',
    dataStoreReference: 'dataStore',
    textAnnotation: 'textAnnotation',
  };

  for (const [tagName, nodeType] of Object.entries(typeMap)) {
    const elements = doc.getElementsByTagNameNS(ns, tagName);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const id = el.getAttribute('id') || uuidv4();
      nodes.push({
        id,
        type: nodeType,
        label: el.getAttribute('name') || nodeType,
        position: { x: 100 + nodes.length * 200, y: 100 },
      });
    }
  }

  // Parse sequence flows
  const flows = doc.getElementsByTagNameNS(ns, 'sequenceFlow');
  for (let i = 0; i < flows.length; i++) {
    const flow = flows[i];
    edges.push({
      id: flow.getAttribute('id') || uuidv4(),
      type: 'sequenceFlow',
      source: flow.getAttribute('sourceRef') || '',
      target: flow.getAttribute('targetRef') || '',
      label: flow.getAttribute('name') || undefined,
    });
  }

  // Parse message flows
  const msgFlows = doc.getElementsByTagNameNS(ns, 'messageFlow');
  for (let i = 0; i < msgFlows.length; i++) {
    const flow = msgFlows[i];
    edges.push({
      id: flow.getAttribute('id') || uuidv4(),
      type: 'messageFlow',
      source: flow.getAttribute('sourceRef') || '',
      target: flow.getAttribute('targetRef') || '',
      label: flow.getAttribute('name') || undefined,
    });
  }

  return { nodes, edges, swimlanes };
}

export function exportToBPMNXml(diagram: BPMNDiagram): string {
  const { nodes, edges, swimlanes } = diagram;

  const indent = (level: number) => '  '.repeat(level);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"\n`;
  xml += `  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"\n`;
  xml += `  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"\n`;
  xml += `  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"\n`;
  xml += `  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">\n`;

  xml += `${indent(1)}<bpmn:process id="Process_1" isExecutable="false">\n`;

  // Add lanes if present
  if (swimlanes.length > 0) {
    xml += `${indent(2)}<bpmn:laneSet id="LaneSet_1">\n`;
    for (const lane of swimlanes) {
      const laneNodes = nodes.filter((n) => n.swimlaneId === lane.id);
      xml += `${indent(3)}<bpmn:lane id="${lane.id}" name="${lane.label}">\n`;
      for (const node of laneNodes) {
        xml += `${indent(4)}<bpmn:flowNodeRef>${node.id}</bpmn:flowNodeRef>\n`;
      }
      xml += `${indent(3)}</bpmn:lane>\n`;
    }
    xml += `${indent(2)}</bpmn:laneSet>\n`;
  }

  // Add nodes
  const bpmnTagMap: Record<string, string> = {
    startEvent: 'startEvent',
    endEvent: 'endEvent',
    task: 'task',
    userTask: 'userTask',
    serviceTask: 'serviceTask',
    scriptTask: 'scriptTask',
    exclusiveGateway: 'exclusiveGateway',
    parallelGateway: 'parallelGateway',
    inclusiveGateway: 'inclusiveGateway',
    subProcess: 'subProcess',
    intermediateEvent: 'intermediateCatchEvent',
    dataObject: 'dataObjectReference',
    dataStore: 'dataStoreReference',
    textAnnotation: 'textAnnotation',
  };

  for (const node of nodes) {
    const tag = bpmnTagMap[node.type] || 'task';
    const outgoing = edges.filter((e) => e.source === node.id);
    const incoming = edges.filter((e) => e.target === node.id);

    xml += `${indent(2)}<bpmn:${tag} id="${node.id}" name="${node.label}">\n`;
    for (const e of incoming) {
      xml += `${indent(3)}<bpmn:incoming>${e.id}</bpmn:incoming>\n`;
    }
    for (const e of outgoing) {
      xml += `${indent(3)}<bpmn:outgoing>${e.id}</bpmn:outgoing>\n`;
    }
    xml += `${indent(2)}</bpmn:${tag}>\n`;
  }

  // Add edges
  for (const edge of edges) {
    const tag = edge.type === 'messageFlow' ? 'messageFlow' : 'sequenceFlow';
    xml += `${indent(2)}<bpmn:${tag} id="${edge.id}" sourceRef="${edge.source}" targetRef="${edge.target}"`;
    if (edge.label) xml += ` name="${edge.label}"`;
    xml += ` />\n`;
  }

  xml += `${indent(1)}</bpmn:process>\n`;
  xml += `</bpmn:definitions>\n`;

  return xml;
}
