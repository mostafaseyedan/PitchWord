import {
  CATEGORIES,
  RUN_STATUSES,
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
import { createId } from "../utils/id.js";
import { msBetween, nowIso } from "../utils/time.js";
import type { CreateRunParams, RunRepository } from "./run-repository.js";

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

export class InMemoryRunRepository implements RunRepository {
  private runs = new Map<string, Run>();
  private logs: AgentStepLog[] = [];

  async createRun(params: CreateRunParams): Promise<Run> {
    const createdAt = nowIso();
    const run: Run = {
      id: createId(),
      sourceType: params.sourceType,
      status: "queued",
      tone: params.tone,
      category: params.category,
      createdAt,
      input: params.input,
      assets: []
    };
    this.runs.set(run.id, run);
    return run;
  }

  async listRuns(): Promise<Run[]> {
    return [...this.runs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getRun(runId: string): Promise<Run | undefined> {
    return this.runs.get(runId);
  }

  async updateRun(runId: string, updater: (run: Run) => Run): Promise<Run | undefined> {
    const existing = this.runs.get(runId);
    if (!existing) {
      return undefined;
    }
    const updated = updater(existing);
    this.runs.set(runId, updated);
    return updated;
  }

  async setRunStatus(runId: string, status: RunStatus): Promise<Run | undefined> {
    return this.updateRun(runId, (run) => {
      const next: Run = { ...run, status };
      if (status === "researching" && !run.startedAt) {
        next.startedAt = nowIso();
      }
      if (RUN_STATUSES.includes(status) && ["posted", "failed", "review_ready"].includes(status)) {
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
    this.logs.unshift(log);
  }

  async listLogs(runId?: string): Promise<AgentStepLog[]> {
    if (!runId) {
      return [...this.logs];
    }
    return this.logs.filter((log) => log.runId === runId);
  }

  async getLatestLogForStep(runId: string, step: AgentStepName): Promise<AgentStepLog | undefined> {
    return this.logs.find((log) => log.runId === runId && log.stepName === step);
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const runs = await this.listRuns();
    if (runs.length === 0) {
      return defaultSummary();
    }

    const summary = defaultSummary();
    summary.totalRuns = runs.length;

    let completedCount = 0;
    let runtimeAccumulator = 0;

    for (const run of runs) {
      summary.runsByTone[run.tone] += 1;
      summary.runsByCategory[run.category] += 1;

      if (run.status === "posted" || run.status === "review_ready") {
        completedCount += 1;
      }

      if (run.startedAt && run.finishedAt) {
        runtimeAccumulator += msBetween(run.startedAt, run.finishedAt);
      }
    }

    summary.successRate = Number(((completedCount / runs.length) * 100).toFixed(2));
    summary.averageRuntimeMs = Number((runtimeAccumulator / runs.length).toFixed(0));

    for (const log of this.logs) {
      if (log.status !== "failed") {
        continue;
      }
      summary.stepFailureCounts[log.stepName] += 1;
    }

    return summary;
  }

  async recoverStaleRuns(): Promise<number> {
    const inProgress: RunStatus[] = ["queued", "researching", "drafting", "image_generation", "video_generation"];
    let count = 0;
    for (const [id, run] of this.runs) {
      if (inProgress.includes(run.status)) {
        this.runs.set(id, { ...run, status: "failed", finishedAt: nowIso() });
        count += 1;
      }
    }
    return count;
  }
}
