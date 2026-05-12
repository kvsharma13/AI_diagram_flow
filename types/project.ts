// Core project structure
export type TimelineUnit = 'weeks' | 'months';

export interface TemplateStyle {
  background: string;
  headerBg: string;
  headerText: string;
  rowBg: string;
  rowBorder: string;
  barStyle: 'rounded' | 'flat' | 'gradient' | 'glow' | 'outline';
  barBorder: string;
  monthHeaderBg: string;
  monthHeaderText: string;
  gridLines: string;
  shadow: string;
}

export interface Project {
  id: string;
  name: string;
  ganttPhases: GanttPhase[];
  ganttTemplateStyle?: TemplateStyle; // Visual style for Gantt chart
  raciTasks: RACITask[];
  raciStakeholders?: RACIStakeholder[];
  raciAssignments?: RACIAssignment[];
  architectureComponents: ArchitectureComponent[];
  architectureMermaidCode?: string; // Mermaid code for architecture diagram
  flowchartSteps: FlowchartStep[];
  bpmnDiagram?: BPMNDiagram;
  proposalDocument?: ProposalDocument;
  timelineMonths?: number; // Total duration for Gantt timeline (default: 12)
  timelineUnit?: TimelineUnit; // Unit for timeline (default: 'months')
  createdAt: Date;
  updatedAt: Date;
}

// Gantt Editor
export type PhaseColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal' | 'red' | 'indigo' | 'yellow' | 'cyan';

export interface MonthlyBreakdown {
  month: number;
  title: string;
  highlights?: string[];
  deliverables?: string[];
  milestones?: string[];
}

export interface GanttPhase {
  id: string;
  name: string;
  barLabel?: string; // Text shown inside the colored bar (independent from name)
  startMonth: number;
  duration: number;
  deliverables: string;
  color?: PhaseColor;
  months?: MonthlyBreakdown[]; // Detailed monthly breakdown
}

// RACI Matrix
// Supports single values ('R', 'A', 'C', 'I') or combined values ('R/A', 'C/I', etc.)
export type RACIValue = string | null;

export interface RACIStakeholder {
  id: string;
  name: string;
  role?: string;
}

export interface RACITask {
  id: string;
  taskName: string;
  description?: string;
}

export interface RACIAssignment {
  taskId: string;
  stakeholderId: string;
  value: RACIValue;
}

// Architecture Diagram
export type ComponentType = 'frontend' | 'backend' | 'database' | 'service';

export interface ArchitectureComponent {
  id: string;
  name: string;
  type: ComponentType;
  position: { x: number; y: number };
}

// Flowchart
export type FlowchartStepType = 'start' | 'process' | 'decision' | 'end';

export interface FlowchartStep {
  id: string;
  label: string;
  type: FlowchartStepType;
  position: { x: number; y: number };
}

// BPMN Process Flow
export type BPMNNodeType =
  | 'startEvent'
  | 'endEvent'
  | 'task'
  | 'userTask'
  | 'serviceTask'
  | 'scriptTask'
  | 'exclusiveGateway'
  | 'parallelGateway'
  | 'inclusiveGateway'
  | 'subProcess'
  | 'intermediateEvent'
  | 'dataObject'
  | 'dataStore'
  | 'textAnnotation';

export type BPMNEdgeType = 'sequenceFlow' | 'messageFlow' | 'association';

export interface BPMNNode {
  id: string;
  type: BPMNNodeType;
  label: string;
  description?: string;
  assignee?: string;
  swimlaneId?: string;
  position: { x: number; y: number };
  data?: Record<string, any>;
}

export interface BPMNSwimlane {
  id: string;
  label: string;
  role: string;
  color?: string;
  order: number;
}

export interface BPMNEdge {
  id: string;
  type: BPMNEdgeType;
  source: string;
  target: string;
  label?: string;
  conditionExpression?: string;
  animated?: boolean;
}

export interface BPMNDiagram {
  nodes: BPMNNode[];
  edges: BPMNEdge[];
  swimlanes: BPMNSwimlane[];
}

// Proposal Builder
export type ProposalSectionType =
  | 'cover'
  | 'executive_summary'
  | 'scope'
  | 'timeline'
  | 'stakeholders'
  | 'architecture'
  | 'bpmn_process'
  | 'risks'
  | 'budget'
  | 'assumptions'
  | 'deliverables'
  | 'terms'
  | 'appendix'
  | 'custom';

export interface ProposalSection {
  id: string;
  type: ProposalSectionType;
  title: string;
  content: string;
  order: number;
  diagramSnapshot?: string;
  isVisible: boolean;
  metadata?: Record<string, any>;
}

export interface ProposalBranding {
  companyName: string;
  companyLogo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  headerStyle: string;
}

export type ProposalTemplateId =
  | 'sow'
  | 'brd'
  | 'project_charter'
  | 'technical_proposal'
  | 'rfp_response'
  | 'blank';

export interface ProposalDocument {
  sections: ProposalSection[];
  branding: ProposalBranding;
  templateId: ProposalTemplateId;
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  version?: string;
}

// Editor types
export type EditorType = 'gantt' | 'raci' | 'architecture' | 'flowchart' | 'bpmn' | 'proposal' | 'templates';