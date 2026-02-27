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

// Editor types
export type EditorType = 'gantt' | 'raci' | 'architecture' | 'flowchart' | 'templates';
