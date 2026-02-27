import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Project,
  GanttPhase,
  RACITask,
  RACIStakeholder,
  RACIAssignment,
  RACIValue,
  ArchitectureComponent,
  FlowchartStep,
  EditorType,
  TimelineUnit,
  TemplateStyle,
} from '@/types/project';

interface ProjectStore {
  // State
  project: Project | null;
  currentEditor: EditorType;

  // Core actions
  createProject: (name: string) => void;
  setProject: (project: Project) => void;
  setCurrentEditor: (editor: EditorType) => void;
  setTimelineMonths: (months: number) => void;
  setTimelineUnit: (unit: TimelineUnit) => void;

  // Gantt actions
  addPhase: (phase: Omit<GanttPhase, 'id'>) => void;
  updatePhase: (id: string, updates: Partial<GanttPhase>) => void;
  deletePhase: (id: string) => void;
  loadGanttTemplate: (phases: Omit<GanttPhase, 'id'>[], timelineMonths: number, style?: TemplateStyle) => void;

  // RACI actions
  addTask: (task: Omit<RACITask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<RACITask>) => void;
  deleteTask: (id: string) => void;
  addStakeholder: (stakeholder: Omit<RACIStakeholder, 'id'>) => void;
  updateStakeholder: (id: string, updates: Partial<RACIStakeholder>) => void;
  deleteStakeholder: (id: string) => void;
  setRACIValue: (taskId: string, stakeholderId: string, value: RACIValue) => void;

  // Architecture actions
  addComponent: (component: Omit<ArchitectureComponent, 'id'>) => void;
  updateComponent: (id: string, updates: Partial<ArchitectureComponent>) => void;
  deleteComponent: (id: string) => void;
  setArchitectureMermaidCode: (code: string) => void;

  // Flowchart actions
  addStep: (step: Omit<FlowchartStep, 'id'>) => void;
  updateStep: (id: string, updates: Partial<FlowchartStep>) => void;
  deleteStep: (id: string) => void;

  // Template actions
  loadTemplate: (templateName: string) => void;

  // Import/Export actions
  importGanttFromCode: (data: any) => void;
  importRACIFromCode: (data: any) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // Initial state
  project: null,
  currentEditor: 'gantt',

  // Core actions
  createProject: (name: string) =>
    set({
      project: {
        id: uuidv4(),
        name,
        ganttPhases: [],
        raciTasks: [],
        raciStakeholders: [],
        raciAssignments: [],
        architectureComponents: [],
        architectureMermaidCode: '',
        flowchartSteps: [],
        timelineMonths: 12,
        timelineUnit: 'months',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),

  setProject: (project: Project) =>
    set({ project }),

  setCurrentEditor: (editor: EditorType) =>
    set({ currentEditor: editor }),

  setTimelineMonths: (months: number) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          timelineMonths: months,
          updatedAt: new Date(),
        },
      };
    }),

  setTimelineUnit: (unit: TimelineUnit) =>
    set((state) => {
      if (!state.project) return state;

      // Convert timeline duration when switching units
      const currentDuration = state.project.timelineMonths || 12;
      const currentUnit = state.project.timelineUnit || 'months';

      let newDuration = currentDuration;
      if (currentUnit !== unit) {
        // Convert between weeks and months (roughly 4 weeks per month)
        if (unit === 'weeks') {
          newDuration = Math.round(currentDuration * 4);
        } else {
          newDuration = Math.max(1, Math.round(currentDuration / 4));
        }
      }

      return {
        project: {
          ...state.project,
          timelineUnit: unit,
          timelineMonths: newDuration,
          updatedAt: new Date(),
        },
      };
    }),

  // Gantt actions
  addPhase: (phase) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          ganttPhases: [
            ...state.project.ganttPhases,
            { ...phase, id: uuidv4() },
          ],
          updatedAt: new Date(),
        },
      };
    }),

  updatePhase: (id, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          ganttPhases: state.project.ganttPhases.map((phase) =>
            phase.id === id ? { ...phase, ...updates } : phase
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deletePhase: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          ganttPhases: state.project.ganttPhases.filter((phase) => phase.id !== id),
          updatedAt: new Date(),
        },
      };
    }),

  loadGanttTemplate: (phases, timelineMonths, style) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          ganttPhases: phases.map((phase) => ({ ...phase, id: uuidv4() })),
          timelineMonths,
          ganttTemplateStyle: style,
          updatedAt: new Date(),
        },
      };
    }),

  // RACI actions
  addTask: (task) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciTasks: [...state.project.raciTasks, { ...task, id: uuidv4() }],
          updatedAt: new Date(),
        },
      };
    }),

  updateTask: (id, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciTasks: state.project.raciTasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deleteTask: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciTasks: state.project.raciTasks.filter((task) => task.id !== id),
          raciAssignments: (state.project.raciAssignments || []).filter((a) => a.taskId !== id),
          updatedAt: new Date(),
        },
      };
    }),

  addStakeholder: (stakeholder) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciStakeholders: [
            ...(state.project.raciStakeholders || []),
            { ...stakeholder, id: uuidv4() },
          ],
          updatedAt: new Date(),
        },
      };
    }),

  updateStakeholder: (id, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciStakeholders: (state.project.raciStakeholders || []).map((stakeholder) =>
            stakeholder.id === id ? { ...stakeholder, ...updates } : stakeholder
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deleteStakeholder: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          raciStakeholders: (state.project.raciStakeholders || []).filter(
            (stakeholder) => stakeholder.id !== id
          ),
          raciAssignments: (state.project.raciAssignments || []).filter(
            (a) => a.stakeholderId !== id
          ),
          updatedAt: new Date(),
        },
      };
    }),

  setRACIValue: (taskId, stakeholderId, value) =>
    set((state) => {
      if (!state.project) return state;

      const assignments = state.project.raciAssignments || [];
      const existingIndex = assignments.findIndex(
        (a) => a.taskId === taskId && a.stakeholderId === stakeholderId
      );

      let newAssignments;
      if (value === null) {
        // Remove assignment
        newAssignments = assignments.filter(
          (a) => !(a.taskId === taskId && a.stakeholderId === stakeholderId)
        );
      } else if (existingIndex >= 0) {
        // Update existing
        newAssignments = assignments.map((a, i) =>
          i === existingIndex ? { ...a, value } : a
        );
      } else {
        // Add new
        newAssignments = [...assignments, { taskId, stakeholderId, value }];
      }

      return {
        project: {
          ...state.project,
          raciAssignments: newAssignments,
          updatedAt: new Date(),
        },
      };
    }),

  // Architecture actions
  addComponent: (component) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          architectureComponents: [
            ...state.project.architectureComponents,
            { ...component, id: uuidv4() },
          ],
          updatedAt: new Date(),
        },
      };
    }),

  updateComponent: (id, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          architectureComponents: state.project.architectureComponents.map(
            (component) =>
              component.id === id ? { ...component, ...updates } : component
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deleteComponent: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          architectureComponents: state.project.architectureComponents.filter(
            (component) => component.id !== id
          ),
          updatedAt: new Date(),
        },
      };
    }),

  setArchitectureMermaidCode: (code) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          architectureMermaidCode: code,
          updatedAt: new Date(),
        },
      };
    }),

  // Flowchart actions
  addStep: (step) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          flowchartSteps: [
            ...state.project.flowchartSteps,
            { ...step, id: uuidv4() },
          ],
          updatedAt: new Date(),
        },
      };
    }),

  updateStep: (id, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          flowchartSteps: state.project.flowchartSteps.map((step) =>
            step.id === id ? { ...step, ...updates } : step
          ),
          updatedAt: new Date(),
        },
      };
    }),

  deleteStep: (id) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          flowchartSteps: state.project.flowchartSteps.filter(
            (step) => step.id !== id
          ),
          updatedAt: new Date(),
        },
      };
    }),

  // Template actions
  loadTemplate: (templateName: string) =>
    set((state) => {
      const templates: Record<string, Partial<Project>> = {
        sow: {
          id: uuidv4(),
          name: 'SOW Project',
          timelineMonths: 12,
          timelineUnit: 'months' as const,
          ganttPhases: [
            {
              id: uuidv4(),
              name: 'Discovery & Planning',
              startMonth: 1,
              duration: 2,
              deliverables: 'Requirements document, Project plan, Technical architecture',
              color: 'purple' as const,
            },
            {
              id: uuidv4(),
              name: 'Design & Development',
              startMonth: 3,
              duration: 4,
              deliverables: 'UI/UX designs, Core features, Database schema',
              color: 'blue' as const,
            },
            {
              id: uuidv4(),
              name: 'Testing & QA',
              startMonth: 7,
              duration: 2,
              deliverables: 'Test cases, Bug fixes, Performance optimization',
              color: 'green' as const,
            },
            {
              id: uuidv4(),
              name: 'Deployment & Support',
              startMonth: 9,
              duration: 2,
              deliverables: 'Production deployment, User training, Documentation',
              color: 'orange' as const,
            },
          ],
          raciTasks: [
            { id: 'task-1', taskName: 'Requirements Gathering', description: 'Collect and document project requirements' },
            { id: 'task-2', taskName: 'System Design', description: 'Design system architecture and components' },
            { id: 'task-3', taskName: 'Frontend Development', description: 'Build user interface and client-side logic' },
            { id: 'task-4', taskName: 'Backend Development', description: 'Implement server-side logic and APIs' },
            { id: 'task-5', taskName: 'Quality Assurance', description: 'Test and verify system functionality' },
            { id: 'task-6', taskName: 'Deployment', description: 'Deploy to production environment' },
          ],
          raciStakeholders: [
            { id: 'sh-1', name: 'Project Manager', role: 'Management' },
            { id: 'sh-2', name: 'Tech Lead', role: 'Technical' },
            { id: 'sh-3', name: 'Business Analyst', role: 'Analysis' },
            { id: 'sh-4', name: 'Development Team', role: 'Engineering' },
            { id: 'sh-5', name: 'QA Team', role: 'Quality' },
          ],
          raciAssignments: [
            { taskId: 'task-1', stakeholderId: 'sh-3', value: 'R' },
            { taskId: 'task-1', stakeholderId: 'sh-1', value: 'A' },
            { taskId: 'task-1', stakeholderId: 'sh-4', value: 'I' },
            { taskId: 'task-2', stakeholderId: 'sh-2', value: 'R' },
            { taskId: 'task-2', stakeholderId: 'sh-1', value: 'A' },
            { taskId: 'task-2', stakeholderId: 'sh-4', value: 'C' },
            { taskId: 'task-3', stakeholderId: 'sh-4', value: 'R' },
            { taskId: 'task-3', stakeholderId: 'sh-2', value: 'A' },
            { taskId: 'task-3', stakeholderId: 'sh-5', value: 'I' },
            { taskId: 'task-4', stakeholderId: 'sh-4', value: 'R' },
            { taskId: 'task-4', stakeholderId: 'sh-2', value: 'A' },
            { taskId: 'task-5', stakeholderId: 'sh-5', value: 'R' },
            { taskId: 'task-5', stakeholderId: 'sh-1', value: 'A' },
            { taskId: 'task-5', stakeholderId: 'sh-4', value: 'C' },
            { taskId: 'task-6', stakeholderId: 'sh-2', value: 'R' },
            { taskId: 'task-6', stakeholderId: 'sh-1', value: 'A' },
            { taskId: 'task-6', stakeholderId: 'sh-4', value: 'C' },
          ],
          architectureComponents: [],
          architectureMermaidCode: `graph TB
    subgraph "Client Layer"
        Web[Web Application<br/>React]
    end

    subgraph "API Layer"
        Gateway[API Gateway]
        Auth[Auth Service]
    end

    subgraph "Application Layer"
        API[REST API<br/>Node.js]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Database)]
        Cache[(Redis<br/>Cache)]
    end

    Web --> Gateway
    Gateway --> Auth
    Gateway --> API
    API --> DB
    API --> Cache

    style Web fill:#61DAFB,stroke:#000,stroke-width:2px
    style Gateway fill:#FF6C37,stroke:#000,stroke-width:2px
    style Auth fill:#6DB33F,stroke:#000,stroke-width:2px
    style API fill:#68A063,stroke:#000,stroke-width:2px
    style DB fill:#336791,stroke:#000,stroke-width:2px
    style Cache fill:#DC382D,stroke:#000,stroke-width:2px`,
          flowchartSteps: [
            {
              id: uuidv4(),
              label: 'Start',
              type: 'start',
              position: { x: 250, y: 50 },
            },
            {
              id: uuidv4(),
              label: 'User Authentication',
              type: 'process',
              position: { x: 250, y: 150 },
            },
            {
              id: uuidv4(),
              label: 'Valid Credentials?',
              type: 'decision',
              position: { x: 250, y: 250 },
            },
            {
              id: uuidv4(),
              label: 'Access Granted',
              type: 'end',
              position: { x: 250, y: 350 },
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        proposal: {
          id: uuidv4(),
          name: 'Proposal Project',
          timelineMonths: 6,
          timelineUnit: 'months' as const,
          ganttPhases: [
            {
              id: uuidv4(),
              name: 'Research & Analysis',
              startMonth: 1,
              duration: 1,
              deliverables: 'Market research, Competitive analysis',
              color: 'purple' as const,
            },
            {
              id: uuidv4(),
              name: 'Proposal Development',
              startMonth: 2,
              duration: 2,
              deliverables: 'Technical proposal, Cost estimation, Timeline',
              color: 'blue' as const,
            },
            {
              id: uuidv4(),
              name: 'Review & Finalization',
              startMonth: 4,
              duration: 1,
              deliverables: 'Final proposal document, Presentation deck',
              color: 'green' as const,
            },
          ],
          raciTasks: [
            { id: 'task-p1', taskName: 'Market Research', description: 'Analyze market and competitors' },
            { id: 'task-p2', taskName: 'Technical Writing', description: 'Write technical sections' },
            { id: 'task-p3', taskName: 'Cost Estimation', description: 'Calculate project costs' },
            { id: 'task-p4', taskName: 'Final Review', description: 'Review and approve proposal' },
          ],
          raciStakeholders: [
            { id: 'sh-p1', name: 'Sales Director', role: 'Sales' },
            { id: 'sh-p2', name: 'Proposal Manager', role: 'Management' },
            { id: 'sh-p3', name: 'Research Team', role: 'Research' },
            { id: 'sh-p4', name: 'Finance Team', role: 'Finance' },
          ],
          raciAssignments: [
            { taskId: 'task-p1', stakeholderId: 'sh-p3', value: 'R' },
            { taskId: 'task-p1', stakeholderId: 'sh-p1', value: 'A' },
            { taskId: 'task-p2', stakeholderId: 'sh-p2', value: 'R' },
            { taskId: 'task-p2', stakeholderId: 'sh-p1', value: 'A' },
            { taskId: 'task-p3', stakeholderId: 'sh-p4', value: 'R' },
            { taskId: 'task-p3', stakeholderId: 'sh-p1', value: 'A' },
            { taskId: 'task-p3', stakeholderId: 'sh-p2', value: 'C' },
            { taskId: 'task-p4', stakeholderId: 'sh-p2', value: 'R' },
            { taskId: 'task-p4', stakeholderId: 'sh-p1', value: 'A' },
          ],
          architectureComponents: [],
          architectureMermaidCode: `graph LR
    Client[Client Portal<br/>Web Application]
    Server[Application Server<br/>Business Logic]
    DB[(Database<br/>Data Storage)]

    Client --> Server
    Server --> DB

    style Client fill:#61DAFB,stroke:#000,stroke-width:2px
    style Server fill:#68A063,stroke:#000,stroke-width:2px
    style DB fill:#336791,stroke:#000,stroke-width:2px`,
          flowchartSteps: [
            {
              id: uuidv4(),
              label: 'Receive RFP',
              type: 'start',
              position: { x: 250, y: 50 },
            },
            {
              id: uuidv4(),
              label: 'Analyze Requirements',
              type: 'process',
              position: { x: 250, y: 150 },
            },
            {
              id: uuidv4(),
              label: 'Submit Proposal',
              type: 'end',
              position: { x: 250, y: 250 },
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const template = templates[templateName.toLowerCase()];
      if (template) {
        return {
          project: template as Project,
        };
      }
      return state;
    }),

  // Import from code actions
  importGanttFromCode: (data) =>
    set((state) => {
      if (!state.project) return state;

      try {
        console.log('Importing Gantt data:', data);

        const defaultColors = ['purple', 'blue', 'green', 'orange', 'pink', 'teal'];

        // Handle nested timeline/raciMatrix structure
        const timelineData = data.timeline || data;

        // Handle different JSON formats
        let phasesData = timelineData.phases || data.phases || [];
        console.log('Phases found:', phasesData.length);

        const phases = phasesData.map((p: any, index: number) => {
          // Calculate startMonth and duration from various formats
          let startMonth = p.startMonth || p.start || 1;
          let duration = p.duration || p.duration_months || 1;

          // Handle endMonth format
          if (p.endMonth && p.startMonth) {
            duration = p.endMonth - p.startMonth + 1;
          } else if (p.end_month && p.duration_months) {
            startMonth = p.end_month - p.duration_months + 1;
            duration = p.duration_months;
          }

          // Extract deliverables - either as string or from monthly breakdown
          let deliverables = p.deliverables || p.key_deliverable || p.deliverable || '';

          // If no top-level deliverables but has monthly data, combine them
          if (!deliverables && p.months && p.months.length > 0) {
            const allDeliverables = p.months
              .flatMap((m: any) => m.deliverables || [])
              .filter((d: string) => d);
            deliverables = allDeliverables.slice(0, 3).join(', ');
            if (allDeliverables.length > 3) deliverables += '...';
          }

          // Process monthly breakdown - normalize tasks/highlights field
          let months = p.months;
          if (months && months.length > 0) {
            months = months.map((m: any) => ({
              ...m,
              highlights: m.highlights || m.tasks || [], // Support both 'highlights' and 'tasks'
            }));
          }

          console.log(`Phase ${index}: ${p.name}, months: ${months?.length || 0}`);

          return {
            id: uuidv4(),
            name: p.name || p.phase || 'Unnamed Phase',
            startMonth: startMonth,
            duration: duration,
            deliverables: deliverables,
            color: p.color || defaultColors[index % defaultColors.length],
            months: months || undefined,
          };
        });

        // Calculate total timeline months
        const maxEndMonth = Math.max(...phases.map(p => p.startMonth + p.duration - 1));
        const timelineMonths = timelineData.totalMonths || data.timelineMonths || data.duration || maxEndMonth || 12;

        console.log('Import complete:', {
          phases: phases.length,
          timelineMonths,
          hasMonthlyData: phases.some(p => p.months && p.months.length > 0)
        });

        return {
          project: {
            ...state.project,
            ganttPhases: phases,
            timelineMonths: timelineMonths,
            timelineUnit: data.timelineUnit || 'months',
            ganttTemplateStyle: data.style,
            updatedAt: new Date(),
          },
        };
      } catch (error) {
        console.error('Failed to import Gantt data:', error);
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return state;
      }
    }),

  importRACIFromCode: (data) =>
    set((state) => {
      if (!state.project) return state;

      try {
        console.log('Starting RACI import...', data);

        // Handle nested raciMatrix format
        const raciData = data.raciMatrix || data;

        // Import stakeholders/roles
        const stakeholdersList = raciData.stakeholders || raciData.roles || [];
        console.log('Stakeholders found:', stakeholdersList);

        const stakeholders = stakeholdersList.map((s: any) => {
          const parts = typeof s === 'string' ? s.split(/[(\-]/) : [];
          return {
            id: uuidv4(),
            name: typeof s === 'string' ? parts[0]?.trim() || s : s.name || 'Unnamed Stakeholder',
            role: typeof s === 'string' ? parts[1]?.replace(/[)\]]/g, '').trim() || '' : s.role || '',
          };
        });

        // Import tasks
        const tasksList = raciData.tasks || [];
        console.log('Tasks found:', tasksList.length);

        const tasks = tasksList.map((t: any) => ({
          id: uuidv4(),
          taskName: typeof t === 'string' ? t : t.activity || t.taskName || t.name || 'Unnamed Task',
          description: typeof t === 'string' ? '' : t.category || t.description || '',
        }));

        // Import assignments
        const assignments: RACIAssignment[] = [];

        if (raciData.assignments) {
          console.log('Using assignments object format');
          // Format 1: assignments object
          Object.entries(raciData.assignments).forEach(([taskKey, stakeholderMap]: [string, any]) => {
            const taskIndex = tasksList.findIndex((t: any) =>
              (typeof t === 'string' ? t : t.taskName || t.name || t.activity) === taskKey
            );

            if (taskIndex >= 0) {
              Object.entries(stakeholderMap).forEach(([stakeholderKey, value]: [string, any]) => {
                const stakeholderIndex = stakeholdersList.findIndex((s: any) => {
                  const name = typeof s === 'string' ? s.split(/[(\-]/)[0]?.trim() : s.name;
                  return name === stakeholderKey || name?.includes(stakeholderKey);
                });

                if (stakeholderIndex >= 0 && value) {
                  assignments.push({
                    taskId: tasks[taskIndex].id,
                    stakeholderId: stakeholders[stakeholderIndex].id,
                    value: value as RACIValue,
                  });
                }
              });
            }
          });
        } else if (tasksList.length > 0 && typeof tasksList[0] === 'object') {
          console.log('Using inline task format');
          // Format 2: inline assignments in task objects

          // Create a mapping of simplified role names to stakeholder indices
          const roleMapping = new Map<string, number>();
          stakeholders.forEach((s, index) => {
            const simplifiedName = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            roleMapping.set(simplifiedName, index);

            // Also add common abbreviations found in parentheses
            const match = s.name.match(/\(([^)]+)\)/);
            if (match) {
              const abbrev = match[1].toLowerCase().replace(/[^a-z0-9]/g, '');
              roleMapping.set(abbrev, index);
            }

            // Add custom mappings for common abbreviations
            const customMappings: Record<string, string[]> = {
              'Ministry of Public Service': ['mps'],
              'Pilot Ministries': ['pilotministries'],
              'MindMap Digital': ['mindmapdigital', 'mindmap'],
              'Government IT': ['govit', 'governmentit'],
              'Compliance Officer': ['complianceofficer'],
              'Steering Committee': ['steeringcommittee'],
            };

            Object.entries(customMappings).forEach(([key, abbrevs]) => {
              if (s.name.toLowerCase().includes(key.toLowerCase())) {
                abbrevs.forEach(abbrev => roleMapping.set(abbrev, index));
              }
            });
          });

          console.log('Role mapping:', Array.from(roleMapping.entries()));

          tasksList.forEach((task: any, taskIndex: number) => {
            // Map role keys to assignments
            const roleKeys = Object.keys(task).filter(key =>
              !['activity', 'taskName', 'name', 'category', 'description'].includes(key)
            );

            console.log(`Task ${taskIndex} role keys:`, roleKeys);

            roleKeys.forEach(roleKey => {
              const value = task[roleKey];
              if (!value) return;

              // Try exact match first
              const simplifiedKey = roleKey.toLowerCase().replace(/[^a-z0-9]/g, '');
              let stakeholderIndex = roleMapping.get(simplifiedKey);

              // If no exact match, try partial matching
              if (stakeholderIndex === undefined) {
                for (const [mappedKey, index] of roleMapping.entries()) {
                  if (mappedKey.includes(simplifiedKey) || simplifiedKey.includes(mappedKey)) {
                    stakeholderIndex = index;
                    break;
                  }
                }
              }

              if (stakeholderIndex !== undefined) {
                console.log(`Matched ${roleKey} -> ${stakeholders[stakeholderIndex].name} = ${value}`);
                assignments.push({
                  taskId: tasks[taskIndex].id,
                  stakeholderId: stakeholders[stakeholderIndex].id,
                  value: value as RACIValue,
                });
              } else {
                console.warn(`No match found for role key: ${roleKey}`);
              }
            });
          });
        }

        console.log('Import complete:', {
          tasks: tasks.length,
          stakeholders: stakeholders.length,
          assignments: assignments.length
        });

        return {
          project: {
            ...state.project,
            raciTasks: tasks,
            raciStakeholders: stakeholders,
            raciAssignments: assignments,
            updatedAt: new Date(),
          },
        };
      } catch (error) {
        console.error('Failed to import RACI data:', error);
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return state;
      }
    }),
}));
