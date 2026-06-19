import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const body = await request.json();

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update project
    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update({
        name: body.name,
        gantt_phases: body.ganttPhases,
        gantt_template_style: body.ganttTemplateStyle,
        raci_tasks: body.raciTasks,
        raci_stakeholders: body.raciStakeholders,
        raci_assignments: body.raciAssignments,
        architecture_components: body.architectureComponents,
        architecture_mermaid_code: body.architectureMermaidCode,
        bpmn_nodes: body.bpmnNodes,
        bpmn_edges: body.bpmnEdges,
        bpmn_swimlanes: body.bpmnSwimlanes,
        proposal_sections: body.proposalSections,
        proposal_branding: body.proposalBranding,
        proposal_template_id: body.proposalTemplateId,
        proposal_title: body.proposalTitle,
        proposal_subtitle: body.proposalSubtitle,
        proposal_author: body.proposalAuthor,
        proposal_version: body.proposalVersion,
        timeline_months: body.timelineMonths,
        timeline_unit: body.timelineUnit,
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    // BA modules — best-effort, separate update so existing saves never break
    // if the BA-columns migration (supabase/migrations/0001_ba_modules.sql)
    // has not been applied yet.
    try {
      const baUpdate: Record<string, any> = {};
      if (body.brd !== undefined) baUpdate.brd = body.brd;
      if (body.requirements !== undefined) baUpdate.requirements = body.requirements;
      if (body.userStories !== undefined) baUpdate.user_stories = body.userStories;
      if (body.useCaseDiagram !== undefined) baUpdate.use_case_diagram = body.useCaseDiagram;
      if (body.erd !== undefined) baUpdate.erd = body.erd;
      if (body.asIsToBe !== undefined) baUpdate.as_is_to_be = body.asIsToBe;
      if (body.traceabilityMatrix !== undefined) baUpdate.traceability_matrix = body.traceabilityMatrix;
      if (body.testCases !== undefined) baUpdate.test_cases = body.testCases;
      if (body.gapAnalysis !== undefined) baUpdate.gap_analysis = body.gapAnalysis;
      if (body.businessCase !== undefined) baUpdate.business_case = body.businessCase;

      if (Object.keys(baUpdate).length > 0) {
        const { error: baError } = await supabaseAdmin
          .from('projects')
          .update(baUpdate)
          .eq('id', projectId)
          .eq('user_id', user.id);
        if (baError) {
          console.warn('BA module columns not saved — run supabase/migrations/0001_ba_modules.sql:', baError.message);
        }
      }
    } catch (e) {
      console.warn('BA module update skipped:', e);
    }

    // Architecture diagram — its own isolated best-effort update so a missing
    // architecture_diagram column never blocks the BA-module save above.
    try {
      if (body.architectureDiagram !== undefined) {
        const { error: archError } = await supabaseAdmin
          .from('projects')
          .update({ architecture_diagram: body.architectureDiagram })
          .eq('id', projectId)
          .eq('user_id', user.id);
        if (archError) {
          console.warn('Architecture diagram not saved — run supabase/migrations/0002_architecture_diagram.sql:', archError.message);
        }
      }
    } catch (e) {
      console.warn('Architecture diagram update skipped:', e);
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete project
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
