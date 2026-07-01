'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Check } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { useArchitectureStore } from '@/store/architectureStore';
import GanttEditor from '@/editors/GanttEditor';
import RACIMatrixEditor from '@/editors/RACIMatrixEditor';
import ArchitectureEditor from '@/editors/ArchitectureEditor';
import BPMNEditor from '@/editors/BPMNEditor';
import ProposalEditor from '@/editors/ProposalEditor';
import { EditorType } from '@/types/project';
import {
  EMPTY_BRD, EMPTY_REQUIREMENTS, EMPTY_USER_STORIES, EMPTY_USECASE, EMPTY_ERD,
  EMPTY_AS_IS_TO_BE, EMPTY_TRACEABILITY, EMPTY_TEST_CASES, EMPTY_GAP_ANALYSIS, EMPTY_BUSINESS_CASE,
} from '@/lib/ba/defaults';
import BAModuleNav from '@/components/ba/BAModuleNav';
import ComingSoon from '@/components/ba/ComingSoon';
import { isBAModule } from '@/lib/ba/modules';
import BRDEditor from '@/editors/BRDEditor';
import RequirementsEditor from '@/editors/RequirementsEditor';
import UserStoriesEditor from '@/editors/UserStoriesEditor';
import UseCaseEditor from '@/editors/UseCaseEditor';
import ERDEditor from '@/editors/ERDEditor';
import AsIsToBeEditor from '@/editors/AsIsToBeEditor';
import TraceabilityEditor from '@/editors/TraceabilityEditor';
import TestCaseEditor from '@/editors/TestCaseEditor';
import GapAnalysisEditor from '@/editors/GapAnalysisEditor';
import BusinessCaseEditor from '@/editors/BusinessCaseEditor';
import BADashboardEditor from '@/editors/BADashboardEditor';

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { project, setProject } = useProjectStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeEditor, setActiveEditor] = useState<EditorType>('baDashboard');
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Becomes true once the project (and its architecture diagram) has finished
  // loading, so the mirror subscription below ignores load-time store writes.
  const archLoadedRef = useRef(false);

  // Load project from database
  useEffect(() => {
    archLoadedRef.current = false;
    loadProject();
  }, [projectId]);

  // The architecture diagram lives in its own store (architectureStore) and holds
  // two independent boards (Flowchart + Cloud). Mirror BOTH boards + the active
  // mode into the project so the existing auto-save persists them.
  useEffect(() => {
    const unsub = useArchitectureStore.subscribe((state, prev) => {
      if (!archLoadedRef.current) return;
      if (state.boards === prev.boards && state.architectureMode === prev.architectureMode) return;
      const proj = useProjectStore.getState().project;
      if (!proj) return;
      useProjectStore.getState().setProject({
        ...proj,
        architectureDiagram: { boards: state.boards, mode: state.architectureMode },
      });
    });
    return unsub;
  }, []);

  // Auto-save when project changes (debounced)
  useEffect(() => {
    if (!project || isLoading) return;

    const timeout = setTimeout(() => {
      saveProject();
    }, 3000); // Save 3 seconds after last change

    return () => clearTimeout(timeout);
  }, [project]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        router.push('/dashboard/projects');
        return;
      }

      const { project: dbProject } = await response.json();

      // Convert database format to store format
      setProject({
        id: dbProject.id,
        name: dbProject.name,
        ganttPhases: dbProject.gantt_phases || [],
        ganttTemplateStyle: dbProject.gantt_template_style,
        raciTasks: dbProject.raci_tasks || [],
        raciStakeholders: dbProject.raci_stakeholders || [],
        raciAssignments: dbProject.raci_assignments || [],
        architectureComponents: dbProject.architecture_components || [],
        architectureMermaidCode: dbProject.architecture_mermaid_code,
        architectureDiagram: dbProject.architecture_diagram || null,
        flowchartSteps: dbProject.flowchart_steps || [],
        bpmnDiagram: {
          nodes: dbProject.bpmn_nodes || [],
          edges: dbProject.bpmn_edges || [],
          swimlanes: dbProject.bpmn_swimlanes || [],
        },
        proposalDocument: {
          sections: dbProject.proposal_sections || [],
          branding: dbProject.proposal_branding || { companyName: '', primaryColor: '#6366f1', secondaryColor: '#ec4899', fontFamily: 'Inter', headerStyle: 'modern' },
          templateId: dbProject.proposal_template_id || 'blank',
          title: dbProject.proposal_title || '',
          subtitle: dbProject.proposal_subtitle,
          author: dbProject.proposal_author,
          version: dbProject.proposal_version,
        },
        // BA modules. The DB defaults object columns to '{}', which is truthy
        // but lacks the expected nested fields — so MERGE onto the full empty
        // shape rather than `|| EMPTY()` (arrays stay `|| []`).
        brd: { ...EMPTY_BRD(), ...(dbProject.brd || {}) },
        requirements: dbProject.requirements || EMPTY_REQUIREMENTS(),
        userStories: { ...EMPTY_USER_STORIES(), ...(dbProject.user_stories || {}) },
        useCaseDiagram: { ...EMPTY_USECASE(), ...(dbProject.use_case_diagram || {}) },
        erd: { ...EMPTY_ERD(), ...(dbProject.erd || {}) },
        asIsToBe: { ...EMPTY_AS_IS_TO_BE(), ...(dbProject.as_is_to_be || {}) },
        traceabilityMatrix: { ...EMPTY_TRACEABILITY(), ...(dbProject.traceability_matrix || {}) },
        testCases: dbProject.test_cases || EMPTY_TEST_CASES(),
        gapAnalysis: { ...EMPTY_GAP_ANALYSIS(), ...(dbProject.gap_analysis || {}) },
        businessCase: { ...EMPTY_BUSINESS_CASE(), ...(dbProject.business_case || {}) },
        timelineMonths: dbProject.timeline_months || 12,
        timelineUnit: dbProject.timeline_unit || 'months',
        createdAt: new Date(dbProject.created_at),
        updatedAt: new Date(dbProject.updated_at),
      });

      setProjectName(dbProject.name);

      // Restore the architecture boards into the store (or clear them so a
      // previously-open project's diagrams don't leak into this one).
      const arch = useArchitectureStore.getState();
      const archData = dbProject.architecture_diagram;
      if (archData?.boards) {
        arch.loadBoards(archData.boards, archData.mode || 'infrastructure');
      } else if (archData?.nodes) {
        arch.loadDiagram(archData); // legacy single-diagram shape
      } else {
        arch.resetDiagram();
      }
      archLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/dashboard/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = useCallback(async () => {
    if (!project || isSaving) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: project.name,
          ganttPhases: project.ganttPhases,
          ganttTemplateStyle: project.ganttTemplateStyle,
          raciTasks: project.raciTasks,
          raciStakeholders: project.raciStakeholders,
          raciAssignments: project.raciAssignments,
          architectureComponents: project.architectureComponents,
          architectureMermaidCode: project.architectureMermaidCode,
          architectureDiagram: project.architectureDiagram ?? null,
          bpmnNodes: project.bpmnDiagram?.nodes || [],
          bpmnEdges: project.bpmnDiagram?.edges || [],
          bpmnSwimlanes: project.bpmnDiagram?.swimlanes || [],
          proposalSections: project.proposalDocument?.sections || [],
          proposalBranding: project.proposalDocument?.branding,
          proposalTemplateId: project.proposalDocument?.templateId,
          proposalTitle: project.proposalDocument?.title,
          proposalSubtitle: project.proposalDocument?.subtitle,
          proposalAuthor: project.proposalDocument?.author,
          proposalVersion: project.proposalDocument?.version,
          // BA modules
          brd: project.brd,
          requirements: project.requirements,
          userStories: project.userStories,
          useCaseDiagram: project.useCaseDiagram,
          erd: project.erd,
          asIsToBe: project.asIsToBe,
          traceabilityMatrix: project.traceabilityMatrix,
          testCases: project.testCases,
          gapAnalysis: project.gapAnalysis,
          businessCase: project.businessCase,
          timelineMonths: project.timelineMonths,
          timelineUnit: project.timelineUnit,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  }, [project, projectId, isSaving]);

  const handleNameUpdate = async () => {
    if (!projectName.trim() || !project) return;

    const updatedProject = { ...project, name: projectName };
    setProject(updatedProject);
    setIsEditingName(false);
    await saveProject();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="flex-shrink-0" style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
        {/* Single compact row — leaves the maximum canvas to each module. */}
        <div className="px-4 md:px-6 py-2 flex items-center justify-between gap-3">
          {/* Left: back + project name */}
          <div className="flex items-center gap-2.5 min-w-0">
            {activeEditor === 'baDashboard' ? (
              <Link
                href="/dashboard/projects"
                className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft className="w-4 h-4" /> Projects
              </Link>
            ) : (
              <button
                onClick={() => setActiveEditor('baDashboard')}
                className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </button>
            )}
            <div className="w-px h-5 flex-shrink-0" style={{ background: 'var(--border)' }} />
            {isEditingName ? (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleNameUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameUpdate();
                  if (e.key === 'Escape') {
                    setProjectName(project?.name || '');
                    setIsEditingName(false);
                  }
                }}
                className="text-lg font-bold px-2 py-0.5 border-2 border-purple-500 rounded focus:outline-none min-w-0"
                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-lg font-bold cursor-pointer truncate px-2 py-0.5 rounded hover:bg-[rgba(37,99,235,0.08)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {project?.name}
              </h1>
            )}
          </div>

          {/* Right: save status + save + module nav */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
              </span>
            ) : lastSaved ? (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-green-400">
                <Check className="w-3.5 h-3.5" /> Saved {lastSaved.toLocaleTimeString()}
              </span>
            ) : null}
            <button
              onClick={saveProject}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-40"
              style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <BAModuleNav active={activeEditor} onSelect={setActiveEditor} />
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {activeEditor === 'gantt' && <GanttEditor />}
        {activeEditor === 'raci' && <RACIMatrixEditor />}
        {activeEditor === 'architecture' && <ArchitectureEditor />}
        {activeEditor === 'bpmn' && <BPMNEditor />}
        {activeEditor === 'proposal' && <ProposalEditor />}
        {/* BA modules */}
        {activeEditor === 'brd' && <BRDEditor />}
        {activeEditor === 'requirements' && <RequirementsEditor />}
        {activeEditor === 'userStories' && <UserStoriesEditor />}
        {activeEditor === 'useCase' && <UseCaseEditor />}
        {activeEditor === 'erd' && <ERDEditor />}
        {activeEditor === 'asIsToBe' && <AsIsToBeEditor />}
        {activeEditor === 'traceability' && <TraceabilityEditor />}
        {activeEditor === 'testCases' && <TestCaseEditor />}
        {activeEditor === 'gapAnalysis' && <GapAnalysisEditor />}
        {activeEditor === 'businessCase' && <BusinessCaseEditor />}
        {activeEditor === 'baDashboard' && <BADashboardEditor onOpen={setActiveEditor} />}
        {isBAModule(activeEditor) && !['baDashboard', 'brd', 'requirements', 'userStories', 'useCase', 'erd', 'asIsToBe', 'traceability', 'testCases', 'gapAnalysis', 'businessCase'].includes(activeEditor) && <ComingSoon module={activeEditor} />}
      </div>
    </div>
  );
}
