import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractText, isAcceptedFile } from '@/lib/documents/extractText';
import { analyzeTextToBrief, mergeBriefs } from '@/lib/documents/analyzeBrief';

// Analysis can take a while for a large RFP.
export const maxDuration = 60;
export const runtime = 'nodejs';

const BUCKET = 'project-documents';
const MAX_SIZE = 4 * 1024 * 1024; // 4MB — Vercel serverless request body limit

type OwnedCtx = { user: { id: string }; project: { id: string; client_brief: any } };

async function getOwnedProject(
  clerkUserId: string,
  projectId: string
): Promise<OwnedCtx | { error: string; status: 401 | 404 }> {
  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_user_id', clerkUserId).single();
  if (!user) return { error: 'User not found', status: 404 };
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('id, client_brief')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();
  if (!project) return { error: 'Project not found', status: 404 };
  return { user, project };
}

function mapDoc(d: any) {
  return {
    id: d.id,
    fileName: d.file_name,
    fileType: d.file_type,
    fileSize: d.file_size,
    status: d.status,
    error: d.error || undefined,
    createdAt: d.created_at,
  };
}

// GET — list a project's uploaded documents
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: projectId } = await params;

  const ctx = await getOwnedProject(userId, projectId);
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { data, error } = await supabaseAdmin
    .from('project_documents')
    .select('id, file_name, file_type, file_size, status, error, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to list documents — run supabase/migrations/0003_client_sources.sql', details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ documents: (data || []).map(mapDoc) });
}

// POST — upload a document, extract its text, analyse it into the client brief
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id: projectId } = await params;

  const ctx = await getOwnedProject(userId, projectId);
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { user, project } = ctx;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileName = (file as File).name || 'document';
  const fileType = (file as File).type || '';
  const fileSize = (file as File).size || 0;

  if (!isAcceptedFile(fileName, fileType)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload a PDF, DOCX, or TXT.' }, { status: 415 });
  }
  if (fileSize > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 4MB).' }, { status: 413 });
  }

  const buffer = Buffer.from(await (file as File).arrayBuffer());
  const storagePath = `${user.id}/${projectId}/${Date.now()}-${fileName}`.replace(/\s+/g, '_');

  // Record the document up front so the UI can reflect it immediately.
  const { data: inserted, error: insErr } = await supabaseAdmin
    .from('project_documents')
    .insert({
      project_id: projectId,
      user_id: user.id,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      storage_path: storagePath,
      status: 'analyzing',
    })
    .select('id, file_name, file_type, file_size, status, error, created_at')
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: 'Failed to save document — run supabase/migrations/0003_client_sources.sql', details: insErr?.message },
      { status: 500 }
    );
  }
  const docId = inserted.id;

  // Store the raw file (best-effort — analysis proceeds regardless).
  try {
    await supabaseAdmin.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: fileType || 'application/octet-stream',
      upsert: true,
    });
  } catch {
    /* non-fatal: the brief is what matters downstream */
  }

  // Extract text -> analyse into a brief -> merge into the project's brief.
  try {
    const { text } = await extractText(buffer, fileType, fileName);
    if (!text || text.length < 20) {
      throw new Error('No readable text found in the document (is it a scanned image?).');
    }

    const incoming = await analyzeTextToBrief(text);
    const merged = mergeBriefs(project.client_brief, incoming, fileName);
    merged.updatedAt = new Date().toISOString();

    await supabaseAdmin.from('projects').update({ client_brief: merged }).eq('id', projectId).eq('user_id', user.id);
    await supabaseAdmin
      .from('project_documents')
      .update({ extracted_text: text.slice(0, 200_000), status: 'ready' })
      .eq('id', docId);

    return NextResponse.json({ document: { ...mapDoc(inserted), status: 'ready' }, clientBrief: merged });
  } catch (err: any) {
    const msg = err?.message || 'Analysis failed';
    await supabaseAdmin.from('project_documents').update({ status: 'error', error: msg }).eq('id', docId);
    return NextResponse.json({ error: msg, document: { ...mapDoc(inserted), status: 'error', error: msg } }, { status: 500 });
  }
}
