-- Persist the React Flow architecture diagram (nodes / edges / mode) used by the
-- Flowchart and Cloud Architecture modes. Stored as JSONB on the project row.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS architecture_diagram JSONB;
