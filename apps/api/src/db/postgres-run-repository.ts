import postgres from "postgres";
import {
  CATEGORIES,
  TONES,
  type AgentStepLog,
  type AgentStepName,
  type AnalyticsSummary,
  type Asset,
  type Category,
  type Run,
  type RunStatus,
  type TeamsDelivery,
  type Tone
} from "@marketing/shared";
import type { CreateRunParams, RunRepository } from "../repositories/run-repository.js";
import { createId } from "../utils/id.js";
import { msBetween, nowIso } from "../utils/time.js";

const defaultSummary = (): AnalyticsSummary => ({
  totalRuns: 0,
  successRate: 0,
  averageRuntimeMs: 0,
  runsByTone: Object.fromEntries(TONES.map((tone) => [tone, 0])) as Record<Tone, number>,
  runsByCategory: Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<Category, number>,
  stepFailureCounts: {
    news_hunter: 0,
    content_creator: 0,
    image_agent: 0,
    video_agent: 0,
    teams_delivery: 0
  }
});

interface RunRow {
  id: string;
  source_type: Run["sourceType"];
  status: RunStatus;
  tone: Tone;
  category: Category;
  created_at: Date | string;
  started_at: Date | string | null;
  finished_at: Date | string | null;
  input: Run["input"];
  news_topic: string | null;
  news_summary: string | null;
  draft: Run["draft"] | null;
  assets: Asset[];
  teams_delivery: TeamsDelivery | null;
}

interface LogRow {
  id: string;
  run_id: string;
  step_name: AgentStepName;
  status: AgentStepLog["status"];
  message: string;
  started_at: Date | string;
  ended_at: Date | string | null;
  metadata: Record<string, unknown> | null;
  error_code: string | null;
  error_message: string | null;
}

export class PostgresRunRepository implements RunRepository {
  private readonly sql: postgres.Sql;

  constructor(databaseUrl: string) {
    this.sql = postgres(databaseUrl, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 15
    });
  }

  async close(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }

  async migrate(): Promise<void> {
    await this.sql.unsafe(`
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
    `);
  }

  async createRun(params: CreateRunParams): Promise<Run> {
    const run: Run = {
      id: createId(),
      sourceType: params.sourceType,
      status: "queued",
      tone: params.tone,
      category: params.category,
      createdAt: nowIso(),
      input: params.input,
      assets: []
    };

    await this.sql`
      INSERT INTO runs (
        id, source_type, status, tone, category,
        created_at, input, assets
      ) VALUES (
        ${run.id}, ${run.sourceType}, ${run.status}, ${run.tone}, ${run.category},
        ${run.createdAt}, ${this.sql.json(run.input as unknown as any)}, ${this.sql.json(run.assets as unknown as any)}
      )
    `;

    return run;
  }

  async listRuns(): Promise<Run[]> {
    const rows = await this.sql<RunRow[]>`SELECT * FROM runs ORDER BY created_at DESC`;
    return rows.map((row) => this.rowToRun(row));
  }

  async getRun(runId: string): Promise<Run | undefined> {
    const [row] = await this.sql<RunRow[]>`SELECT * FROM runs WHERE id = ${runId} LIMIT 1`;
    return row ? this.rowToRun(row) : undefined;
  }

  async updateRun(runId: string, updater: (run: Run) => Run): Promise<Run | undefined> {
    const existing = await this.getRun(runId);
    if (!existing) {
      return undefined;
    }

    const updated = updater(existing);

    await this.sql`
      UPDATE runs
      SET
        source_type = ${updated.sourceType},
        status = ${updated.status},
        tone = ${updated.tone},
        category = ${updated.category},
        created_at = ${updated.createdAt},
        started_at = ${updated.startedAt ?? null},
        finished_at = ${updated.finishedAt ?? null},
        input = ${this.sql.json(updated.input as unknown as any)},
        news_topic = ${updated.newsTopic ?? null},
        news_summary = ${updated.newsSummary ?? null},
        draft = ${updated.draft ? this.sql.json(updated.draft as unknown as any) : null},
        assets = ${this.sql.json(updated.assets as unknown as any)},
        teams_delivery = ${updated.teamsDelivery ? this.sql.json(updated.teamsDelivery as unknown as any) : null}
      WHERE id = ${runId}
    `;

    return updated;
  }

  async setRunStatus(runId: string, status: RunStatus): Promise<Run | undefined> {
    return this.updateRun(runId, (run) => {
      const next: Run = { ...run, status };
      if (status === "researching" && !run.startedAt) {
        next.startedAt = nowIso();
      }
      if (status === "review_ready" || status === "posted" || status === "failed") {
        next.finishedAt = nowIso();
      }
      return next;
    });
  }

  async addAsset(runId: string, asset: Asset): Promise<Run | undefined> {
    return this.updateRun(runId, (run) => ({ ...run, assets: [...run.assets, asset] }));
  }

  async setTeamsDelivery(runId: string, delivery: TeamsDelivery): Promise<Run | undefined> {
    return this.updateRun(runId, (run) => ({ ...run, teamsDelivery: delivery }));
  }

  async appendLog(log: AgentStepLog): Promise<void> {
    await this.sql`
      INSERT INTO agent_step_logs (
        id, run_id, step_name, status, message,
        started_at, ended_at, metadata, error_code, error_message
      ) VALUES (
        ${log.id}, ${log.runId}, ${log.stepName}, ${log.status}, ${log.message},
        ${log.startedAt}, ${log.endedAt ?? null}, ${log.metadata ? this.sql.json(log.metadata as unknown as any) : null},
        ${log.errorCode ?? null}, ${log.errorMessage ?? null}
      )
    `;
  }

  async listLogs(runId?: string): Promise<AgentStepLog[]> {
    const rows = runId
      ? await this.sql<LogRow[]>`
          SELECT * FROM agent_step_logs
          WHERE run_id = ${runId}
          ORDER BY started_at DESC
        `
      : await this.sql<LogRow[]>`SELECT * FROM agent_step_logs ORDER BY started_at DESC`;

    return rows.map((row) => this.rowToLog(row));
  }

  async getLatestLogForStep(runId: string, step: AgentStepName): Promise<AgentStepLog | undefined> {
    const [row] = await this.sql<LogRow[]>`
      SELECT * FROM agent_step_logs
      WHERE run_id = ${runId} AND step_name = ${step}
      ORDER BY started_at DESC
      LIMIT 1
    `;

    return row ? this.rowToLog(row) : undefined;
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const runs = await this.listRuns();
    const logs = await this.listLogs();

    if (runs.length === 0) {
      return defaultSummary();
    }

    const summary = defaultSummary();
    summary.totalRuns = runs.length;

    let successful = 0;
    let runtimeMs = 0;

    for (const run of runs) {
      summary.runsByTone[run.tone] += 1;
      summary.runsByCategory[run.category] += 1;

      if (run.status === "posted" || run.status === "review_ready") {
        successful += 1;
      }

      if (run.startedAt && run.finishedAt) {
        runtimeMs += msBetween(run.startedAt, run.finishedAt);
      }
    }

    summary.successRate = Number(((successful / runs.length) * 100).toFixed(2));
    summary.averageRuntimeMs = Number((runtimeMs / runs.length).toFixed(0));

    for (const log of logs) {
      if (log.status === "failed") {
        summary.stepFailureCounts[log.stepName] += 1;
      }
    }

    return summary;
  }

  async recoverStaleRuns(): Promise<number> {
    const staleStatuses = ["queued", "researching", "drafting", "image_generation", "video_generation"];
    const result = await this.sql`
      UPDATE runs
      SET status = 'failed', finished_at = NOW()
      WHERE status = ANY(${staleStatuses})
      RETURNING id
    `;
    return result.length;
  }

  private rowToRun(row: RunRow): Run {
    return {
      id: row.id,
      sourceType: row.source_type,
      status: row.status,
      tone: row.tone,
      category: row.category,
      createdAt: this.toIso(row.created_at) ?? nowIso(),
      startedAt: this.toIso(row.started_at),
      finishedAt: this.toIso(row.finished_at),
      input: row.input,
      newsTopic: row.news_topic ?? undefined,
      newsSummary: row.news_summary ?? undefined,
      draft: row.draft ?? undefined,
      assets: row.assets ?? [],
      teamsDelivery: row.teams_delivery ?? undefined
    };
  }

  private rowToLog(row: LogRow): AgentStepLog {
    return {
      id: row.id,
      runId: row.run_id,
      stepName: row.step_name,
      status: row.status,
      message: row.message,
      startedAt: this.toIso(row.started_at) ?? nowIso(),
      endedAt: this.toIso(row.ended_at),
      metadata: row.metadata ?? undefined,
      errorCode: row.error_code ?? undefined,
      errorMessage: row.error_message ?? undefined
    };
  }

  private toIso(value: Date | string | null | undefined): string | undefined {
    if (!value) {
      return undefined;
    }
    return new Date(value).toISOString();
  }
}
