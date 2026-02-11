import type {
  AgentStepLog,
  AgentStepName,
  AnalyticsSummary,
  Asset,
  Category,
  Run,
  RunStatus,
  TeamsDelivery,
  Tone
} from "@marketing/shared";

export interface CreateRunParams {
  sourceType: Run["sourceType"];
  tone: Tone;
  category: Category;
  input: Run["input"];
}

export interface RunRepository {
  createRun(params: CreateRunParams): Promise<Run>;
  listRuns(): Promise<Run[]>;
  getRun(runId: string): Promise<Run | undefined>;
  updateRun(runId: string, updater: (run: Run) => Run): Promise<Run | undefined>;
  setRunStatus(runId: string, status: RunStatus): Promise<Run | undefined>;
  addAsset(runId: string, asset: Asset): Promise<Run | undefined>;
  setTeamsDelivery(runId: string, delivery: TeamsDelivery): Promise<Run | undefined>;
  appendLog(log: AgentStepLog): Promise<void>;
  listLogs(runId?: string): Promise<AgentStepLog[]>;
  getLatestLogForStep(runId: string, step: AgentStepName): Promise<AgentStepLog | undefined>;
  getAnalyticsSummary(): Promise<AnalyticsSummary>;
  recoverStaleRuns(): Promise<number>;
}
