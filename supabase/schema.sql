-- Create users table (extends Clerk auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'inactive', -- active, inactive, cancelled, trialing
  subscription_plan_type TEXT DEFAULT 'basic', -- basic (₹900), pro (₹2000)
  subscription_id TEXT, -- Razorpay subscription ID
  razorpay_customer_id TEXT, -- Razorpay customer ID
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Project',

  -- Gantt chart data
  gantt_phases JSONB DEFAULT '[]',
  gantt_template_style JSONB,
  timeline_months INTEGER DEFAULT 12,
  timeline_unit TEXT DEFAULT 'months',

  -- RACI matrix data
  raci_tasks JSONB DEFAULT '[]',
  raci_stakeholders JSONB DEFAULT '[]',
  raci_assignments JSONB DEFAULT '[]',

  -- Architecture & Flowchart (for future)
  architecture_components JSONB DEFAULT '[]',
  architecture_mermaid_code TEXT,
  flowchart_steps JSONB DEFAULT '[]',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL, -- 'gantt' or 'raci'
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM' (e.g., '2025-02')
  generations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one record per user per month
  UNIQUE(user_id, month_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_month ON ai_usage(user_id, month_year);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_updated_at BEFORE UPDATE ON ai_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for projects table
CREATE POLICY "Users can read their own projects"
  ON projects FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- RLS Policies for ai_usage table
CREATE POLICY "Users can read their own AI usage"
  ON ai_usage FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can insert their own AI usage"
  ON ai_usage FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Users can update their own AI usage"
  ON ai_usage FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub'));
