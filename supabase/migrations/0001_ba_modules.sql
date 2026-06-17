-- ============================================================
-- BA Modules migration
-- Adds one JSONB column per BA module to the existing `projects`
-- table, matching the existing one-column-per-artifact pattern.
-- Safe to run multiple times (IF NOT EXISTS). Run this in the
-- Supabase SQL editor BEFORE using the new BA modules — until it
-- runs, the app still works and BA data simply isn't persisted.
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS brd                  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requirements         JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS user_stories         JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS use_case_diagram     JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS erd                  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS as_is_to_be          JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS traceability_matrix  JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS test_cases           JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS gap_analysis         JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS business_case        JSONB DEFAULT '{}';
