import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - List all projects for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all projects
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Get or create user in Supabase
    let { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!user) {
      // Create user if doesn't exist
      console.log('Creating new user in Supabase:', userId);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: request.headers.get('x-user-email') || `${userId}@user.com`,
          subscription_status: 'active', // Set to active for testing
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({
          error: 'Failed to create user in database',
          details: createError.message
        }, { status: 500 });
      }

      user = newUser;
    }

    // Create project
    console.log('Creating project for user:', user.id);

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: user.id,
        name: name || 'Untitled Project',
        gantt_phases: [],
        raci_tasks: [],
        raci_stakeholders: [],
        raci_assignments: [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({
        error: 'Failed to create project',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('Project created successfully:', project.id);

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
