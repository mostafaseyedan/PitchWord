import { z } from "zod";
import { ASPECT_RATIOS, IMAGE_RESOLUTIONS } from "@marketing/shared";
import type { RouteRegistrar } from "./types.js";

const graphicSchema = z.object({
  prompt: z.string().min(1).max(2400),
  aspectRatio: z.enum(ASPECT_RATIOS).default("16:9"),
  imageResolution: z.enum(IMAGE_RESOLUTIONS).default("1K"),
  stylePresetId: z.string().optional(),
  styleOverride: z.string().max(2400).optional(),
  fontPresetId: z.string().optional(),
  colorSchemeId: z.string().optional(),
  referenceAssetIds: z.array(z.string()).max(14).default([])
});

const graphicTopicSchema = z.object({
  topicHint: z.string().max(2400).optional()
});

export const registerLibraryRoutes: RouteRegistrar = (app, deps) => {
  app.get("/api/library/assets", async () => {
    return deps.libraryService.listAssets();
  });

  app.post("/api/library/assets/upload", async (request, reply) => {
    const part = await (request as any).file();
    if (!part) {
      return reply.status(400).send({ error: "Missing file in multipart body" });
    }
    const saved = await deps.libraryService.uploadFromPart(part);
    return reply.status(201).send(saved);
  });

  app.delete("/api/library/assets/:assetId", async (request, reply) => {
    const assetId = String((request.params as { assetId?: string })?.assetId ?? "").trim();
    if (!assetId) {
      return reply.status(400).send({ error: "Missing assetId path parameter" });
    }

    const deleted = await deps.libraryService.deleteAsset(assetId);
    if (!deleted) {
      return reply.status(404).send({ error: "Asset not found" });
    }

    return reply.status(200).send({ deleted: true });
  });

  app.post("/api/library/graphics/generate", async (request, reply) => {
    const parsed = graphicSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const asset = await deps.graphicGenerationService.generate(parsed.data);
    return reply.status(201).send({ asset });
  });

  app.post("/api/library/graphics/topic", async (request, reply) => {
    const parsed = graphicTopicSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }
    const prompts = await deps.graphicTopicService.generatePrompts(parsed.data);
    return reply.status(200).send({ prompts });
  });
};
