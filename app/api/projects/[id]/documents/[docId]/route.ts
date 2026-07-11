import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const BUCKET = 'project-documents';

// DELETE — remove an uploaded document (row + stored file).
// Note: the distilled client brief is intentionally left intact, since it may
// have been merged from several documents and hand-edited.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: projectId, docId } = await params;

  const { data: user } = await supabaseAdmin.from('users').select('id').eq('clerk_user_id', userId).single();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Verify the document belongs to this user's project.
  const { data: doc } = await supabaseAdmin
    .from('project_documents')
    .select('id, storage_path, user_id, project_id')
    .eq('id', docId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single();

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

  if (doc.storage_path) {
    try {
      await supabaseAdmin.storage.from(BUCKET).remove([doc.storage_path]);
    } catch {
      /* non-fatal */
    }
  }

  const { error } = await supabaseAdmin.from('project_documents').delete().eq('id', docId).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });

  return NextResponse.json({ success: true });
}
