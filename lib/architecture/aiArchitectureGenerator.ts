import { Node, Edge, Layer } from '@/types/architecture';

export interface AIArchitecturePrompt {
  description: string;
  mode: 'application' | 'infrastructure';
}

export interface AIArchitectureResponse {
  nodes: Node[];
  edges: Edge[];
  layers: Layer[];
}

export async function generateArchitectureWithAI(
  prompt: AIArchitecturePrompt
): Promise<AIArchitectureResponse> {
  // This is a placeholder - you'll need to add your OpenAI API key
  // For now, return a mock response based on the prompt

  return generateMockArchitecture(prompt);
}

// Mock generator for demo purposes
function generateMockArchitecture(prompt: AIArchitecturePrompt): AIArchitectureResponse {
  const description = prompt.description.toLowerCase();

  if (description.includes('ai') || description.includes('calling') || description.includes('livekit')) {
    return generateAICallingArchitecture();
  } else if (description.includes('ecommerce') || description.includes('shop')) {
    return generateEcommerceArchitecture();
  } else if (description.includes('microservices')) {
    return generateMicroservicesArchitecture();
  }

  // Default architecture
  return generateDefaultArchitecture();
}

function generateAICallingArchitecture(): AIArchitectureResponse {
  const layers: Layer[] = [
    { id: 'client', name: 'Client Layer', color: '#61DAFB' },
    { id: 'api', name: 'API Layer', color: '#68A063' },
    { id: 'services', name: 'Services Layer', color: '#8B5CF6' },
    { id: 'data', name: 'Data Layer', color: '#336791' },
    { id: 'external', name: 'External Services', color: '#F59E0B' },
  ];

  const nodes: Node[] = [
    // Client
    { id: 'web', label: 'Web Dashboard', type: 'frontend', layerId: 'client', position: { x: 100, y: 50 } },
    { id: 'mobile', label: 'Mobile App', type: 'frontend', layerId: 'client', position: { x: 300, y: 50 } },

    // API
    { id: 'gateway', label: 'API Gateway', type: 'api', layerId: 'api', position: { x: 200, y: 200 } },

    // Services
    { id: 'campaign', label: 'Campaign Service', type: 'service', layerId: 'services', position: { x: 50, y: 350 } },
    { id: 'call', label: 'Call Service', type: 'service', layerId: 'services', position: { x: 200, y: 350 } },
    { id: 'ai', label: 'AI Service', type: 'service', layerId: 'services', position: { x: 350, y: 350 } },

    // Data
    { id: 'postgres', label: 'PostgreSQL', type: 'database', layerId: 'data', position: { x: 100, y: 500 } },
    { id: 'redis', label: 'Redis', type: 'cache', layerId: 'data', position: { x: 300, y: 500 } },

    // External
    { id: 'livekit', label: 'LiveKit', type: 'external', layerId: 'external', position: { x: 100, y: 650 } },
    { id: 'openai', label: 'OpenAI', type: 'external', layerId: 'external', position: { x: 300, y: 650 } },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'web', target: 'gateway', animated: true },
    { id: 'e2', source: 'mobile', target: 'gateway', animated: true },
    { id: 'e3', source: 'gateway', target: 'campaign', animated: false },
    { id: 'e4', source: 'gateway', target: 'call', animated: false },
    { id: 'e5', source: 'gateway', target: 'ai', animated: false },
    { id: 'e6', source: 'campaign', target: 'postgres', animated: false },
    { id: 'e7', source: 'call', target: 'postgres', animated: false },
    { id: 'e8', source: 'call', target: 'redis', animated: false },
    { id: 'e9', source: 'ai', target: 'redis', animated: false },
    { id: 'e10', source: 'call', target: 'livekit', animated: true },
    { id: 'e11', source: 'ai', target: 'openai', animated: true },
  ];

  return { nodes, edges, layers };
}

function generateEcommerceArchitecture(): AIArchitectureResponse {
  const layers: Layer[] = [
    { id: 'client', name: 'Client', color: '#61DAFB' },
    { id: 'api', name: 'API Gateway', color: '#68A063' },
    { id: 'services', name: 'Services', color: '#8B5CF6' },
    { id: 'data', name: 'Data', color: '#336791' },
  ];

  const nodes: Node[] = [
    { id: 'web', label: 'Web Store', type: 'frontend', layerId: 'client', position: { x: 200, y: 50 } },
    { id: 'gateway', label: 'API Gateway', type: 'api', layerId: 'api', position: { x: 200, y: 200 } },
    { id: 'product', label: 'Product Service', type: 'service', layerId: 'services', position: { x: 100, y: 350 } },
    { id: 'order', label: 'Order Service', type: 'service', layerId: 'services', position: { x: 300, y: 350 } },
    { id: 'db', label: 'Database', type: 'database', layerId: 'data', position: { x: 200, y: 500 } },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'web', target: 'gateway', animated: true },
    { id: 'e2', source: 'gateway', target: 'product', animated: false },
    { id: 'e3', source: 'gateway', target: 'order', animated: false },
    { id: 'e4', source: 'product', target: 'db', animated: false },
    { id: 'e5', source: 'order', target: 'db', animated: false },
  ];

  return { nodes, edges, layers };
}

function generateMicroservicesArchitecture(): AIArchitectureResponse {
  const layers: Layer[] = [
    { id: 'gateway', name: 'Gateway', color: '#68A063' },
    { id: 'services', name: 'Microservices', color: '#8B5CF6' },
    { id: 'data', name: 'Databases', color: '#336791' },
  ];

  const nodes: Node[] = [
    { id: 'gateway', label: 'API Gateway', type: 'api', layerId: 'gateway', position: { x: 200, y: 50 } },
    { id: 'auth', label: 'Auth Service', type: 'service', layerId: 'services', position: { x: 100, y: 200 } },
    { id: 'user', label: 'User Service', type: 'service', layerId: 'services', position: { x: 300, y: 200 } },
    { id: 'authdb', label: 'Auth DB', type: 'database', layerId: 'data', position: { x: 100, y: 350 } },
    { id: 'userdb', label: 'User DB', type: 'database', layerId: 'data', position: { x: 300, y: 350 } },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'gateway', target: 'auth', animated: false },
    { id: 'e2', source: 'gateway', target: 'user', animated: false },
    { id: 'e3', source: 'auth', target: 'authdb', animated: false },
    { id: 'e4', source: 'user', target: 'userdb', animated: false },
  ];

  return { nodes, edges, layers };
}

function generateDefaultArchitecture(): AIArchitectureResponse {
  const layers: Layer[] = [
    { id: 'client', name: 'Client', color: '#61DAFB' },
    { id: 'api', name: 'API', color: '#68A063' },
    { id: 'backend', name: 'Backend', color: '#8B5CF6' },
    { id: 'data', name: 'Data', color: '#336791' },
  ];

  const nodes: Node[] = [
    { id: 'client', label: 'Client App', type: 'frontend', layerId: 'client', position: { x: 200, y: 50 } },
    { id: 'api', label: 'API Server', type: 'api', layerId: 'api', position: { x: 200, y: 200 } },
    { id: 'backend', label: 'Backend', type: 'service', layerId: 'backend', position: { x: 200, y: 350 } },
    { id: 'db', label: 'Database', type: 'database', layerId: 'data', position: { x: 200, y: 500 } },
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'client', target: 'api', animated: true },
    { id: 'e2', source: 'api', target: 'backend', animated: false },
    { id: 'e3', source: 'backend', target: 'db', animated: false },
  ];

  return { nodes, edges, layers };
}

// For future OpenAI integration:
/*
export async function generateWithOpenAI(prompt: AIArchitecturePrompt): Promise<AIArchitectureResponse> {
  const response = await fetch('/api/generate-architecture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt),
  });

  return response.json();
}
*/
