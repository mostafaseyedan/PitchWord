import type { Asset, ContentDraft } from "@marketing/shared";
import { env } from "../config/env.js";
import { createGeminiClient } from "./gemini-grounding.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

export interface VideoStartOutput {
  result: string;
  meta: {
    model: string;
    prompt: string;
    operationName: string;
  };
}

export class VideoAgentService {
  private ai = createGeminiClient();

  async start(runId: string, draft: ContentDraft, imageUri: string): Promise<VideoStartOutput> {
    if (!this.ai) {
      throw new Error("Vertex client is required. Set VERTEX_GCLOUD_PROJECT for video generation.");
    }

    const prompt = [
      "Generate a short cinematic teaser video for an enterprise marketing post.",
      `Title: ${draft.title}`,
      `Hook: ${draft.hook}`,
      "Style: modern, professional, smooth motion, no text overlays.",
      "Duration: 5 seconds."
    ].join("\n");

    const operation = await this.ai.models.generateVideos({
      model: env.VEO_MODEL,
      source: { prompt },
      config: { numberOfVideos: 1 }
    });

    if (!operation.name) {
      throw new Error("Video generation did not return an operation name.");
    }

    return {
      result: operation.name,
      meta: {
        model: env.VEO_MODEL,
        prompt,
        operationName: operation.name
      }
    };
  }

  async poll(operationName: string): Promise<{ done: boolean; uri?: string }> {
    if (!this.ai) {
      throw new Error("Gemini client is not configured.");
    }

    const operation = await this.ai.operations.getVideosOperation({
      operation: { name: operationName } as any
    });

    if (!operation.done) {
      return { done: false };
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      throw new Error("Video generation completed but returned no video URI.");
    }

    return { done: true, uri: String(uri) };
  }

  createAsset(runId: string, uri: string, generationMs: number): Asset {
    return {
      id: createId(),
      runId,
      type: "video",
      uri,
      modelId: env.VEO_MODEL,
      generationMs,
      createdAt: nowIso()
    };
  }
}
