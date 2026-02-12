import type {
  DailyRunRequest,
  ManualRunRequest,
  Run,
  Tone,
  Category,
  RetryStepRequest,
  PostToTeamsRequest
} from "@marketing/shared";
import { env } from "../config/env.js";
import type { RunRepository } from "../repositories/run-repository.js";
import { InMemoryJobQueue } from "./job-queue.js";
import { RunOrchestrator } from "./run-orchestrator.js";

const isTone = (value: string): value is Tone =>
  ["professional", "urgent_hiring", "educational", "sales_focused", "funny", "engaging", "casual", "absurd"].includes(value);

const isCategory = (value: string): value is Category =>
  ["industry_news", "customer_pain_point", "company_update", "hiring", "product_education", "infor", "team"].includes(
    value
  );

export class RunService {
  constructor(
    private readonly repository: RunRepository,
    private readonly queue: InMemoryJobQueue,
    private readonly orchestrator: RunOrchestrator
  ) {}

  async createDailyRun(payload: DailyRunRequest): Promise<Run> {
    const tone = isTone(payload.tone ?? "") ? payload.tone! : (env.DEFAULT_TONE as Tone);
    const category = isCategory(payload.category ?? "") ? payload.category! : (env.DEFAULT_CATEGORY as Category);

    const run = await this.repository.createRun({
      sourceType: "daily",
      tone,
      category,
      input: {
        uploadedFileRefs: [],
        requestedMedia: payload.requestedMedia ?? "image_only",
        aspectRatio: payload.aspectRatio ?? "16:9",
        imageResolution: payload.imageResolution ?? "1K",
        videoDurationSeconds: payload.videoDurationSeconds ?? 8,
        videoAspectRatio: payload.videoAspectRatio ?? "16:9",
        videoResolution: payload.videoResolution ?? "720p",
        imageStyleInstruction: payload.imageStyleInstruction
      }
    });

    this.queue.enqueue({ runId: run.id });
    return run;
  }

  async createManualRun(payload: ManualRunRequest): Promise<Run> {
    const run = await this.repository.createRun({
      sourceType: "manual",
      tone: payload.tone,
      category: payload.category,
      input: payload.input
    });

    this.queue.enqueue({ runId: run.id });
    return run;
  }

  async listRuns(): Promise<Run[]> {
    return this.repository.listRuns();
  }

  async getRun(runId: string): Promise<Run | undefined> {
    return this.repository.getRun(runId);
  }

  async retryStep(runId: string, request: RetryStepRequest): Promise<Run> {
    return this.orchestrator.retryStep(runId, request);
  }

  async postToTeams(runId: string, request: PostToTeamsRequest): Promise<Run> {
    return this.orchestrator.postToTeams(runId, request);
  }
}
