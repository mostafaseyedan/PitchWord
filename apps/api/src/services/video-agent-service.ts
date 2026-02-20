import { GoogleGenAI } from "@google/genai";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Asset, Category, ContentDraft, RunInput } from "@marketing/shared";
import { env } from "../config/env.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

const defaultLogoPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../web/public/cendien_corp_logo.jpg"
);
const defaultInforLogoPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../web/public/Infor_logo.png"
);
const defaultTeamReferenceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../web/public/Team"
);

interface InlineImagePart {
  mimeType: string;
  data: string;
}

type VideoOperationHandle = unknown;

export interface VideoStartOutput {
  result: VideoOperationHandle;
  meta: {
    model: string;
    prompt: string;
    operationName: string;
    videoDurationSeconds: number;
    videoAspectRatio: string;
    videoResolution: string;
    hasReferenceImages: boolean;
  };
}

export class VideoAgentService {
  private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;
  private logoPartPromise: Promise<InlineImagePart | undefined> | undefined;
  private inforLogoPartPromise: Promise<InlineImagePart | undefined> | undefined;
  private teamPartPromise: Promise<InlineImagePart | undefined> | undefined;

  async start(
    runId: string,
    draft: ContentDraft,
    input: RunInput,
    category: Category,
    imageUri: string
  ): Promise<VideoStartOutput> {
    if (!this.ai) {
      throw new Error("Gemini API key is required for video generation. Set GEMINI_API_KEY.");
    }

    const referenceImages = await this.getReferenceImages(category, imageUri);
    const hasReferenceImages = referenceImages.length > 0;
    const requestedDuration = input.videoDurationSeconds;
    // Veo 3.1 requires 8s for reference-images mode and for 1080p/4k outputs.
    const appliedDuration =
      hasReferenceImages || input.videoResolution === "1080p" || input.videoResolution === "4k" ? 8 : requestedDuration;
    const categoryVideoStyle = this.buildCategoryVideoStyle(category, draft);

    const prompt = [
      "Generate a short cinematic teaser video for an enterprise marketing post.",
      `Title: ${draft.title}`,
      `Category visual style:\n${categoryVideoStyle}`,
      "Use enterprise-grade realism and smooth camera movement.",
      "No text overlays.",
      `Aspect ratio: ${input.videoAspectRatio}.`,
      `Resolution: ${input.videoResolution}.`,
      "If the Cendien logo appears, keep it tasteful and subtle."
    ].join("\n");

    const config: Record<string, unknown> = {
      numberOfVideos: 1,
      durationSeconds: appliedDuration,
      aspectRatio: input.videoAspectRatio,
      resolution: input.videoResolution
    };
    if (referenceImages.length > 0) {
      config.referenceImages = referenceImages;
    }

    const model = this.resolveVideoModel(env.VEO_MODEL);
    const operation = await this.ai.models.generateVideos({
      model,
      prompt,
      config
    });

    if (!operation.name) {
      throw new Error("Video generation did not return an operation name.");
    }

    return {
      result: operation,
      meta: {
        model,
        prompt,
        operationName: operation.name,
        videoDurationSeconds: appliedDuration,
        videoAspectRatio: input.videoAspectRatio,
        videoResolution: input.videoResolution,
        hasReferenceImages
      }
    };
  }

  async poll(operation: VideoOperationHandle): Promise<{ done: boolean; uri?: string; operation: VideoOperationHandle }> {
    if (!this.ai) {
      throw new Error("Gemini client is not configured.");
    }

    const nextOperation = await this.ai.operations.getVideosOperation({
      operation: operation as any
    });

    if (!nextOperation.done) {
      return { done: false, operation: nextOperation };
    }

    const uri = nextOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      throw new Error("Video generation completed but returned no video URI.");
    }

    return { done: true, uri: String(uri), operation: nextOperation };
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

  private async getReferenceImages(category: Category, imageUri: string): Promise<Array<Record<string, unknown>>> {
    const refs: InlineImagePart[] = [];
    const logo = await this.getLogoPart();
    if (logo) {
      refs.push(logo);
    }

    if (category === "team") {
      const team = await this.getTeamReferencePart();
      if (team) {
        refs.push(team);
      }
    } else if (category === "infor") {
      const infor = await this.getInforLogoPart();
      if (infor) {
        refs.push(infor);
      }
    } else {
      const generatedImage = await this.loadImagePartFromUri(imageUri, "generated campaign image");
      if (generatedImage) {
        refs.push(generatedImage);
      }
    }

    return refs.slice(0, 3).map((ref) => ({
      image: {
        imageBytes: ref.data,
        mimeType: ref.mimeType
      },
      referenceType: "asset"
    }));
  }

  private async getLogoPart(): Promise<InlineImagePart | undefined> {
    if (!this.logoPartPromise) {
      const logoPath = env.CENDIEN_LOGO_PATH ?? defaultLogoPath;
      this.logoPartPromise = this.loadImagePartFromFile(logoPath, "Cendien logo");
    }
    return this.logoPartPromise;
  }

  private async getInforLogoPart(): Promise<InlineImagePart | undefined> {
    if (!this.inforLogoPartPromise) {
      this.inforLogoPartPromise = this.loadImagePartFromFile(defaultInforLogoPath, "Infor logo");
    }
    return this.inforLogoPartPromise;
  }

  private async getTeamReferencePart(): Promise<InlineImagePart | undefined> {
    if (!this.teamPartPromise) {
      this.teamPartPromise = this.loadTeamReferencePart();
    }
    return this.teamPartPromise;
  }

  private async loadTeamReferencePart(): Promise<InlineImagePart | undefined> {
    try {
      const entries = await readdir(defaultTeamReferenceDir, { withFileTypes: true });
      const filenames = entries
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
        .sort((a, b) => {
          if (/collage/i.test(a) && !/collage/i.test(b)) return -1;
          if (!/collage/i.test(a) && /collage/i.test(b)) return 1;
          return a.localeCompare(b);
        });

      const first = filenames[0];
      if (!first) {
        return undefined;
      }
      return this.loadImagePartFromFile(path.join(defaultTeamReferenceDir, first), `team reference image ${first}`);
    } catch (error) {
      console.warn(
        `Team reference image could not be loaded from ${defaultTeamReferenceDir}. Video generation will continue without it.`,
        error
      );
      return undefined;
    }
  }

  private async loadImagePartFromUri(uri: string, label: string): Promise<InlineImagePart | undefined> {
    if (!uri) {
      return undefined;
    }

    try {
      if (uri.startsWith("data:")) {
        return this.parseDataUri(uri);
      }

      if (/^https?:\/\//i.test(uri)) {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const bytes = Buffer.from(await response.arrayBuffer());
        const mimeType = (response.headers.get("content-type") || "image/jpeg").split(";")[0]!.trim();
        return {
          mimeType,
          data: bytes.toString("base64")
        };
      }
    } catch (error) {
      console.warn(`${label} could not be loaded from URI. Video generation will continue without it.`, error);
      return undefined;
    }

    return undefined;
  }

  private parseDataUri(uri: string): InlineImagePart {
    const match = /^data:([^;,]+);base64,(.+)$/i.exec(uri);
    if (!match) {
      throw new Error("Invalid data URI format");
    }
    return {
      mimeType: match[1] ?? "image/jpeg",
      data: match[2] ?? ""
    };
  }

  private async loadImagePartFromFile(filePath: string, label: string): Promise<InlineImagePart | undefined> {
    try {
      const bytes = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      return {
        mimeType,
        data: bytes.toString("base64")
      };
    } catch (error) {
      console.warn(`${label} could not be loaded from ${filePath}. Video generation will continue without it.`, error);
      return undefined;
    }
  }

  private resolveVideoModel(input: string): string {
    const trimmed = input.trim();
    if (trimmed === "veo-3.1-fast") {
      return "veo-3.1-fast-generate-preview";
    }
    if (trimmed === "veo-3.1") {
      return "veo-3.1-generate-preview";
    }
    return trimmed;
  }

  private buildCategoryVideoStyle(category: Category, draft: ContentDraft): string {
    switch (category) {
      case "industry_news":
        return [
          "Create a cinematic enterprise news opener for Cendien.",
          "Scene: modern command center at dusk, Dallas skyline in background, transparent data panels animating with market movement.",
          "Camera: fast dolly-in then controlled orbit, strong depth separation, high-contrast editorial lighting.",
          "Mood: urgent, authoritative, forward-looking."
        ].join("\n");
      case "customer_pain_point":
        return [
          "Create a transformation narrative for Cendien.",
          `Focus this concept: ${draft.title}`,
          "Open on a blueprint-like operations diagram with congestion, bottlenecks, and risk signals.",
          "Transition to a clean, stabilized enterprise workflow view with resolved pathways and smooth execution.",
          "Camera: isometric-to-cinematic push with technical clarity.",
          "Style: sepia-to-modern palette shift, engineering annotation aesthetic."
        ].join("\n");
      case "company_update":
        return [
          "Create a premium company milestone video for Cendien.",
          "Scene: executive briefing environment with polished architecture, subtle reflections, and strategic planning surfaces.",
          "Show progression beats: planning to execution to delivery confidence.",
          "Camera: smooth tracking shots with restrained cinematic motion.",
          "Mood: credible, polished, momentum-driven."
        ].join("\n");
      case "hiring":
        return [
          "Create an elite recruiting brand video for Cendien.",
          "Scene: contemporary office, diverse professionals collaborating, mentoring, and problem-solving in realistic moments.",
          "Camera: human-centered movement, warm natural light, shallow depth of field.",
          "Mood: aspirational, energetic, authentic."
        ].join("\n");
      case "product_education":
        return [
          "Create a high-fidelity product-education video.",
          "Subject: exactly one high-end AI server rack floating in dark minimalist space.",
          "Left half must be fully realistic material rendering.",
          "Right half must be precise wireframe interior.",
          "Boundary must be a perfectly vertical hard cut with no blend.",
          "Camera: slow orbit with slight tilt. Single-object hero only. No extra props."
        ].join("\n");
      case "infor":
        return [
          "Create an enterprise integration story for Cendien with Infor context.",
          "Scene: high-end operations environment connecting ERP, service, and supply-chain workflows.",
          "Visualize orchestration pipelines and system handoffs with clean layered interface motion.",
          "Cendien is the primary brand presence; Infor is secondary and tasteful.",
          "Camera: confident lateral move and push-in. Boardroom-ready aesthetic."
        ].join("\n");
      case "team":
        return [
          "Create a realistic team spotlight for Cendien.",
          "Use the team collage reference to keep identity consistency.",
          "Generate one cohesive real-world group moment in a modern conference room with city view.",
          "Everyone should look physically together with consistent lighting from the left, natural reflections, and true perspective.",
          "Action: subtle real interactions such as presenting, listening, and smiling.",
          "Result must feel like one authentic corporate shoot, never a collage."
        ].join("\n");
      default: {
        const exhaustive: never = category;
        return exhaustive;
      }
    }
  }
}
