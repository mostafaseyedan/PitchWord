import type {
  AgentStepLog,
  AgentStepName,
  Citation,
  ContentDraft,
  PostToTeamsRequest,
  RetryStepRequest,
  Run
} from "@marketing/shared";
import { env } from "../config/env.js";
import { AppEventBus } from "../events/event-bus.js";
import type { RunRepository } from "../repositories/run-repository.js";
import { getOrCreateAdkGraph } from "../agents/adk/agent-factory.js";
import { ContentCreatorService } from "./content-creator-service.js";
import { ImageAgentService } from "./image-agent-service.js";
import { NewsHunterService } from "./news-hunter-service.js";
import { TeamsDeliveryService } from "./teams-delivery-service.js";
import { VertexContextService } from "./vertex-context-service.js";
import { VideoAgentService } from "./video-agent-service.js";
import { MediaStorageService } from "./media-storage-service.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export class RunOrchestrator {
  constructor(
    private readonly repository: RunRepository,
    private readonly events: AppEventBus,
    private readonly newsHunterService: NewsHunterService,
    private readonly vertexContextService: VertexContextService,
    private readonly contentCreatorService: ContentCreatorService,
    private readonly imageAgentService: ImageAgentService,
    private readonly videoAgentService: VideoAgentService,
    private readonly mediaStorageService: MediaStorageService,
    private readonly teamsDeliveryService: TeamsDeliveryService
  ) {}

  async executeRun(runId: string): Promise<void> {
    const run = await this.requireRun(runId);

    await getOrCreateAdkGraph();

    try {
      await this.repository.setRunStatus(run.id, "researching");
      await this.publishRun(run.id);

      const newsOutput = await this.withStep(
        run.id,
        "news_hunter",
        async () => {
          if (run.sourceType === "manual" && run.input.manualIdeaText && !run.input.selectedNewsTopic) {
            return {
              result: {
                topic: "Manual idea",
                summary: run.input.manualIdeaText,
                citations: [] as Citation[]
              },
              meta: { model: "none", prompt: "", rawResponseText: undefined, systemInstruction: "" }
            };
          }

          return this.newsHunterService.discover(run.input.selectedNewsTopic, run.tone, run.category);
        },
        (output) => output.meta
      );
      const news = newsOutput.result;

      await this.repository.updateRun(run.id, (current) => ({
        ...current,
        newsTopic: news.topic,
        newsSummary: news.summary
      }));
      await this.publishRun(run.id);

      await this.repository.setRunStatus(run.id, "drafting");
      await this.publishRun(run.id);

      const grounding = await this.vertexContextService.retrieveContext(news.topic, run.input.uploadedFileRefs);

      const contentOutput = await this.withStep(
        run.id,
        "content_creator",
        async () => {
          return this.contentCreatorService.generateDraft({
            tone: run.tone,
            category: run.category,
            newsTopic: news.topic,
            newsSummary: news.summary,
            manualIdeaText: run.input.manualIdeaText,
            groundingSnippet: grounding.contextSnippet,
            citations: [...news.citations, ...grounding.citations]
          });
        },
        (output) => output.meta
      );
      const draft = contentOutput.result;

      await this.repository.updateRun(run.id, (current) => ({
        ...current,
        draft
      }));
      await this.publishRun(run.id);

      await this.repository.setRunStatus(run.id, "image_generation");
      await this.publishRun(run.id);

      const imageOutput = await this.withStep(
        run.id,
        "image_agent",
        async () => {
          const generated = await this.imageAgentService.generate(run.id, draft, run.input, run.category);
          const persisted = await this.mediaStorageService.persistAsset(generated.result);
          return {
            ...generated,
            result: persisted.result,
            storageMeta: persisted.meta
          };
        },
        (output) => ({
          model: output.meta.model,
          hasReferenceImages: output.meta.hasReferenceImages,
          mediaStorage: output.storageMeta
        })
      );
      const imageAsset = imageOutput.result;

      await this.repository.addAsset(run.id, imageAsset);
      await this.publishRun(run.id);

      if (run.input.requestedMedia === "image_video") {
        // Video requested: mark review_ready now, deliver to Teams after video completes
        await this.repository.setRunStatus(run.id, "review_ready");
        await this.publishRun(run.id);
        this.startVideoInBackground(run.id, draft, imageAsset.uri);
      } else {
        // Image only: deliver to Teams immediately
        await this.deliverOrFinalize(run.id);
      }
    } catch (error) {
      await this.repository.setRunStatus(run.id, "failed");
      await this.publishRun(run.id);
      throw error;
    }
  }

  async retryStep(runId: string, request: RetryStepRequest): Promise<Run> {
    const run = await this.requireRun(runId);

    if (request.stepName === "teams_delivery") {
      if (!env.TEAMS_WEBHOOK_URL && (!env.TEAMS_DRAFT_TEAM_ID || !env.TEAMS_DRAFT_CHANNEL_ID)) {
        throw new Error("Cannot retry teams delivery without TEAMS_WEBHOOK_URL or draft team/channel env values");
      }
      await this.postToTeams(runId, {
        teamId: env.TEAMS_DRAFT_TEAM_ID ?? "",
        channelId: env.TEAMS_DRAFT_CHANNEL_ID ?? ""
      });
      return this.requireRun(runId);
    }

    await this.executeRun(runId);
    return this.requireRun(runId);
  }

  async postToTeams(runId: string, request: PostToTeamsRequest): Promise<Run> {
    const run = await this.requireRun(runId);
    if (!run.draft) {
      throw new Error("Cannot post run without draft content");
    }

    await this.withStep(
      runId,
      "teams_delivery",
      async () => {
        const teamsOutput = await this.teamsDeliveryService.postDraft({
          run,
          teamId: request.teamId ?? "",
          channelId: request.channelId ?? ""
        });
        await this.repository.setTeamsDelivery(runId, teamsOutput.result);
        await this.repository.setRunStatus(runId, "posted");
        await this.publishRun(runId);
        return teamsOutput;
      },
      (output) => output.meta
    );

    return this.requireRun(runId);
  }

  private async withStep<T>(
    runId: string,
    stepName: AgentStepName,
    work: () => Promise<T>,
    extractMetadata?: (result: T) => Record<string, unknown>
  ): Promise<T> {
    const startedAt = nowIso();

    await this.appendLog({
      id: createId(),
      runId,
      stepName,
      status: "started",
      message: `${stepName} started`,
      startedAt
    });

    try {
      const result = await work();
      const metadata = extractMetadata ? extractMetadata(result) : undefined;
      const endedAt = nowIso();
      await this.appendLog({
        id: createId(),
        runId,
        stepName,
        status: "completed",
        message: `${stepName} completed`,
        startedAt,
        endedAt,
        metadata
      });
      console.log(
        JSON.stringify({
          level: "info",
          time: Date.now(),
          runId,
          stepName,
          status: "completed",
          startedAt,
          endedAt,
          metadata
        }, null, 2)
      );
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const endedAt = nowIso();
      await this.appendLog({
        id: createId(),
        runId,
        stepName,
        status: "failed",
        message: `${stepName} failed`,
        startedAt,
        endedAt,
        errorCode: "STEP_FAILED",
        errorMessage: message
      });
      console.log(
        JSON.stringify({
          level: "error",
          time: Date.now(),
          runId,
          stepName,
          status: "failed",
          startedAt,
          endedAt,
          errorCode: "STEP_FAILED",
          errorMessage: message
        }, null, 2)
      );
      throw error;
    }
  }

  /**
   * Attempts auto-post to Teams if configured, otherwise marks the run as review_ready.
   */
  private async deliverOrFinalize(runId: string): Promise<void> {
    const hasAutoTeamsTarget = Boolean(
      env.TEAMS_WEBHOOK_URL || (env.TEAMS_DRAFT_TEAM_ID && env.TEAMS_DRAFT_CHANNEL_ID)
    );

    if (env.AUTO_POST_TO_DRAFT_CHANNEL && hasAutoTeamsTarget) {
      const run = await this.requireRun(runId);
      await this.withStep(
        runId,
        "teams_delivery",
        async () => {
          const teamsOutput = await this.teamsDeliveryService.postDraft({
            run,
            teamId: env.TEAMS_DRAFT_TEAM_ID ?? "",
            channelId: env.TEAMS_DRAFT_CHANNEL_ID ?? ""
          });
          await this.repository.setTeamsDelivery(runId, teamsOutput.result);
          await this.repository.setRunStatus(runId, "posted");
          await this.publishRun(runId);
          return teamsOutput;
        },
        (output) => output.meta
      );
    } else {
      await this.repository.setRunStatus(runId, "review_ready");
      await this.publishRun(runId);
    }
  }

  private async appendLog(log: AgentStepLog): Promise<void> {
    await this.repository.appendLog(log);
    this.events.publishLogAdded(log);
  }

  private async publishRun(runId: string): Promise<void> {
    const run = await this.requireRun(runId);
    this.events.publishRunUpdated(run);
  }

  private async requireRun(runId: string): Promise<Run> {
    const run = await this.repository.getRun(runId);
    if (!run) {
      throw new Error(`Run not found: ${runId}`);
    }
    return run;
  }

  /**
   * Fires off video generation and polls in the background.
   * The run is already marked review_ready/posted — video attaches when done.
   */
  private startVideoInBackground(runId: string, draft: ContentDraft, imageUri: string): void {
    const startedAt = nowIso();

    this.appendLog({
      id: createId(),
      runId,
      stepName: "video_agent",
      status: "started",
      message: "video_agent started (background)",
      startedAt
    }).catch(() => {});

    this.videoAgentService
      .start(runId, draft, imageUri)
      .then((startOutput) => {
        this.pollVideoUntilDone(runId, startOutput.result, Date.now(), startedAt, startOutput.meta);
      })
      .catch(async (error) => {
        const message = error instanceof Error ? error.message : String(error);
        await this.appendLog({
          id: createId(),
          runId,
          stepName: "video_agent",
          status: "failed",
          message: "video_agent failed",
          startedAt,
          endedAt: nowIso(),
          errorCode: "VIDEO_START_FAILED",
          errorMessage: message
        }).catch(() => {});
        console.log(JSON.stringify({
          level: "error",
          time: Date.now(),
          runId,
          stepName: "video_agent",
          status: "failed",
          errorCode: "VIDEO_START_FAILED",
          errorMessage: message
        }, null, 2));
      });
  }

  private pollVideoUntilDone(
    runId: string,
    operationName: string,
    startMs: number,
    startedAt: string,
    videoMeta: Record<string, unknown>
  ): void {
    const maxAttempts = 30;
    let attempt = 0;

    const tick = async (): Promise<void> => {
      attempt++;
      try {
        const polled = await this.videoAgentService.poll(operationName);

        if (polled.done && polled.uri) {
          const generationMs = Date.now() - startMs;
          const asset = this.videoAgentService.createAsset(runId, polled.uri, generationMs);
          const persisted = await this.mediaStorageService.persistAsset(asset);
          await this.repository.addAsset(runId, persisted.result);
          await this.publishRun(runId);

          const endedAt = nowIso();
          const metadata = { ...videoMeta, generationMs, mediaStorage: persisted.meta };
          await this.appendLog({
            id: createId(),
            runId,
            stepName: "video_agent",
            status: "completed",
            message: "video_agent completed",
            startedAt,
            endedAt,
            metadata
          });
          console.log(JSON.stringify({
            level: "info",
            time: Date.now(),
            runId,
            stepName: "video_agent",
            status: "completed",
            startedAt,
            endedAt,
            metadata
          }, null, 2));

          // Video done — now deliver to Teams with the full package (image + video)
          await this.deliverOrFinalize(runId);
          return;
        }

        if (attempt >= maxAttempts) {
          await this.appendLog({
            id: createId(),
            runId,
            stepName: "video_agent",
            status: "failed",
            message: "video_agent failed",
            startedAt,
            endedAt: nowIso(),
            errorCode: "VIDEO_TIMEOUT",
            errorMessage: `Video generation timed out after ${attempt} poll attempts (~${Math.round((Date.now() - startMs) / 1000)}s)`
          });
          console.log(JSON.stringify({
            level: "error",
            time: Date.now(),
            runId,
            stepName: "video_agent",
            status: "failed",
            errorCode: "VIDEO_TIMEOUT",
            errorMessage: `Timed out after ${attempt} attempts`
          }, null, 2));
          return;
        }

        // Backoff: 5s → 7.5s → 11s → ... capped at 30s
        const waitMs = Math.min(5000 * Math.pow(1.5, Math.min(attempt - 1, 8)), 30_000);
        setTimeout(() => { tick().catch(() => {}); }, waitMs);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.appendLog({
          id: createId(),
          runId,
          stepName: "video_agent",
          status: "failed",
          message: "video_agent failed",
          startedAt,
          endedAt: nowIso(),
          errorCode: "VIDEO_POLL_ERROR",
          errorMessage: message
        }).catch(() => {});
        console.log(JSON.stringify({
          level: "error",
          time: Date.now(),
          runId,
          stepName: "video_agent",
          status: "failed",
          errorCode: "VIDEO_POLL_ERROR",
          errorMessage: message
        }, null, 2));
      }
    };

    // First poll after 5 seconds
    setTimeout(() => { tick().catch(() => {}); }, 5000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
