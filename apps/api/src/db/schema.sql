CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  source_type TEXT NOT NULL,
  status TEXT NOT NULL,
  tone TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  input JSONB NOT NULL,
  news_topic TEXT,
  news_summary TEXT,
  draft JSONB,
  assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  teams_delivery JSONB
);

CREATE TABLE IF NOT EXISTS agent_step_logs (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  metadata JSONB,
  error_code TEXT,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_run_id ON agent_step_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_logs_step_name ON agent_step_logs(step_name);
