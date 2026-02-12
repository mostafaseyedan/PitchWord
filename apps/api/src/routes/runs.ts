import { z } from "zod";
import {
  ASPECT_RATIOS,
  CATEGORIES,
  IMAGE_RESOLUTIONS,
  TONES,
  VIDEO_ASPECT_RATIOS,
  VIDEO_RESOLUTIONS
} from "@marketing/shared";
import type { RouteRegistrar } from "./types.js";

const dailySchema = z.object({
  tone: z.enum(TONES).optional(),
  category: z.enum(CATEGORIES).optional(),
  requestedMedia: z.enum(["image_only", "image_video"]).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS).optional(),
  imageResolution: z.enum(IMAGE_RESOLUTIONS).optional(),
  videoDurationSeconds: z.union([z.literal(4), z.literal(6), z.literal(8)]).optional(),
  videoAspectRatio: z.enum(VIDEO_ASPECT_RATIOS).optional(),
  videoResolution: z.enum(VIDEO_RESOLUTIONS).optional(),
  imageStyleInstruction: z.string().max(1200).optional()
});

const manualSchema = z.object({
  tone: z.enum(TONES),
  category: z.enum(CATEGORIES),
  input: z.object({
    manualIdeaText: z.string().optional(),
    uploadedFileRefs: z.array(z.string()).default([]),
    requestedMedia: z.enum(["image_only", "image_video"]),
    selectedNewsTopic: z.string().optional(),
    aspectRatio: z.enum(ASPECT_RATIOS).default("16:9"),
    imageResolution: z.enum(IMAGE_RESOLUTIONS).default("1K"),
    videoDurationSeconds: z.union([z.literal(4), z.literal(6), z.literal(8)]).default(8),
    videoAspectRatio: z.enum(VIDEO_ASPECT_RATIOS).default("16:9"),
    videoResolution: z.enum(VIDEO_RESOLUTIONS).default("720p"),
    imageStyleInstruction: z.string().max(1200).optional()
  })
});

const retryStepSchema = z.object({
  stepName: z.enum(["news_hunter", "content_creator", "image_agent", "video_agent", "teams_delivery"])
});

const postToTeamsSchema = z.object({
  recipientEmails: z.array(z.string().email()).min(1)
});

export const registerRunRoutes: RouteRegistrar = (app, deps) => {
  app.post("/api/runs/daily", async (request, reply) => {
    const parsed = dailySchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const run = await deps.runService.createDailyRun(parsed.data);
    return reply.status(202).send(run);
  });

  app.post("/api/runs/manual", async (request, reply) => {
    const parsed = manualSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    const run = await deps.runService.createManualRun(parsed.data);
    return reply.status(202).send(run);
  });

  app.get("/api/runs", async () => {
    return deps.runService.listRuns();
  });

  app.get("/api/runs/:runId", async (request, reply) => {
    const params = request.params as { runId: string };
    const run = await deps.runService.getRun(params.runId);
    if (!run) {
      return reply.status(404).send({ error: "Run not found" });
    }
    return run;
  });

  app.post("/api/runs/:runId/retry-step", async (request, reply) => {
    const params = request.params as { runId: string };
    const parsed = retryStepSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const run = await deps.runService.retryStep(params.runId, parsed.data);
      return run;
    } catch (error) {
      return reply.status(400).send({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/api/runs/:runId/post-to-teams", async (request, reply) => {
    const params = request.params as { runId: string };
    const parsed = postToTeamsSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    try {
      const run = await deps.runService.postToTeams(params.runId, parsed.data);
      return run;
    } catch (error) {
      return reply.status(400).send({ error: error instanceof Error ? error.message : String(error) });
    }
  });
};
