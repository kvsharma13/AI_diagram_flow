-- ============================================================
-- Client Sources migration
-- Adds document upload + a distilled "client brief" to projects.
-- Uploaded RFP/client documents are analysed ONCE into a structured
-- brief that grounds every generator (SOW, requirements, architecture…).
-- Safe to run multiple times. Run in the Supabase SQL editor before
-- using the Sources feature.
-- ============================================================

-- 1) Per-project uploaded documents (metadata + extracted text).
CREATE TABLE IF NOT EXISTS project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_path TEXT,
  extracted_text TEXT,
  status TEXT DEFAULT 'uploaded', -- uploaded | extracting | analyzing | ready | error
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);

-- 2) The distilled structured brief lives on the project row (one per project).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_brief JSONB;

-- 3) Private Storage bucket for the raw files. Uploads happen server-side via
--    the service role, so no extra Storage RLS policies are required here.
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents', 'project-documents', false)
ON CONFLICT (id) DO NOTHING;
