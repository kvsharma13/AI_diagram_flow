export type DiagramTokenType = 'architecture' | 'gantt' | 'bpmn' | 'flowchart' | 'sequence' | 'custom';

export interface DiagramToken {
  uid: string;
  type: DiagramTokenType;
  label: string;
  fullMatch: string;
}

export interface DiagramSlotData {
  type: DiagramTokenType;
  label: string;
  snapshot: string | null;
  mermaidCode?: string;
}

// Matches tokens that already have a UID: {{DIAGRAM:architecture:a1b2c3d4:Label}}
const WITH_UID = /\{\{DIAGRAM:(\w+):([a-z0-9]{8}):([^}]+)\}\}/g;

export function parseTokens(content: string): DiagramToken[] {
  const tokens: DiagramToken[] = [];
  const seen = new Set<string>();
  const re = new RegExp(WITH_UID.source, 'g');
  let m;
  while ((m = re.exec(content)) !== null) {
    if (!seen.has(m[2])) {
      seen.add(m[2]);
      tokens.push({ fullMatch: m[0], type: m[1] as DiagramTokenType, uid: m[2], label: m[3].trim() });
    }
  }
  return tokens;
}

// Assigns UIDs to tokens that don't have one yet (from AI output)
export function assignUIDs(content: string): string {
  return content.replace(
    /\{\{DIAGRAM:(\w+):(?![a-z0-9]{8}:)([^}]+)\}\}/g,
    (_, type, label) => {
      const uid = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return `{{DIAGRAM:${type}:${uid}:${label.trim()}}}`;
    }
  );
}

export function getMermaidTemplate(type: DiagramTokenType): string {
  switch (type) {
    case 'gantt':
      return `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Kickoff & Discovery        :a1, 2024-01-01, 7d
    Requirements Sign-off      :after a1, 7d
    section Phase 2
    Development                :2024-01-15, 30d
    Integration & Testing      :2024-02-15, 14d
    section Phase 3
    UAT                        :2024-03-01, 10d
    Go-Live                    :2024-03-11, 3d`;
    case 'sequence':
      return `sequenceDiagram
    participant Client
    participant Portal
    participant API
    participant DB
    Client->>Portal: Upload Invoice
    Portal->>API: Submit for Processing
    API->>DB: Store & Queue
    DB-->>API: Confirm
    API-->>Portal: Processing Status
    Portal-->>Client: Receipt Confirmation`;
    case 'bpmn':
    case 'flowchart':
      return `flowchart TD
    A([Start]) --> B[Receive Invoice]
    B --> C{Valid Format?}
    C -->|Yes| D[AI Extraction]
    C -->|No| E[Flag for Review]
    D --> F{Confidence > 80%?}
    F -->|Yes| G[Auto-Post to ERP]
    F -->|No| H[Human Review Queue]
    H --> I[Manual Approval]
    I --> G
    G --> J([End])
    E --> J`;
    case 'architecture':
    default:
      return `graph TD
    UI[Web Portal / React] --> GW[API Gateway]
    EMAIL[Email Intake / IMAP] --> GW
    GW --> AUTH[Auth Service]
    GW --> CORE[Core Processing Service]
    CORE --> AI[AI Extraction Engine]
    CORE --> BL[Business Logic Layer]
    BL --> DB[(PostgreSQL Database)]
    BL --> CACHE[Redis Cache]
    BL --> INT[Integration Layer]
    INT --> ERP[ERP System]`;
  }
}

export function getTypeLabel(type: DiagramTokenType): string {
  return {
    architecture: 'Architecture Diagram',
    gantt: 'Gantt Chart',
    bpmn: 'Process Flow (BPMN)',
    flowchart: 'Flowchart',
    sequence: 'Sequence Diagram',
    custom: 'Diagram',
  }[type] ?? 'Diagram';
}

export function getTypeColor(type: DiagramTokenType): string {
  return {
    architecture: 'blue',
    gantt: 'green',
    bpmn: 'purple',
    flowchart: 'orange',
    sequence: 'pink',
    custom: 'gray',
  }[type] ?? 'gray';
}
