import { GoogleGenAI, Modality } from "@google/genai";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Asset, Category, ContentDraft, RunInput } from "@marketing/shared";
import { CENDIEN_CONTEXT } from "../agents/prompts/brand-context.js";
import { env } from "../config/env.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";
import { LibraryService } from "./library-service.js";
import { COLOR_SCHEMES, FONT_PRESETS, getPresetHint, getResolvedStyleHint, STYLE_PRESETS } from "./visual-presets.js";

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

export interface ImageGenerationOutput {
  result: Asset;
  meta: {
    model: string;
    prompt: string;
    generationMs: number;
    aspectRatio: string;
    imageResolution: string;
    hasReferenceImages: boolean;
  };
}

export class ImageAgentService {
  constructor(private readonly libraryService?: LibraryService) { }

  private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;
  private logoPartPromise: Promise<InlineImagePart | undefined> | undefined;
  private inforLogoPartPromise: Promise<InlineImagePart | undefined> | undefined;
  private teamReferencePartPromise: Promise<InlineImagePart | undefined> | undefined;

  async generate(runId: string, draft: ContentDraft, input: RunInput, category: Category): Promise<ImageGenerationOutput> {
    if (!this.ai) {
      throw new Error("Gemini client is not configured. Set GEMINI_API_KEY for image generation.");
    }

    const startedAt = Date.now();
    const brandedTitle = this.ensureCendienInTitle(draft.title);
    const userStyleOverride = input.imageStyleInstruction?.trim();
    const categoryContext =
      category === "infor"
        ? "Category context: Infor partnership. Use the provided Infor reference logo deliberately and professionally when composition allows."
        : category === "team"
          ? "Category context: Team spotlight. Use the provided team reference images to reflect authentic people-forward storytelling."
          : "";
    const brandGuard =
      category === "infor"
        ? "Infor branding is allowed in this category, but keep it secondary and tasteful beside Cendien branding."
        : "Do not include Infor logo, Infor wordmark, or any third-party brand logos. Only Cendien branding is allowed.";
    const stylePresetHint = getResolvedStyleHint(STYLE_PRESETS, input.stylePresetId, input.fontPresetId, input.colorSchemeId);
    const fontPresetHint = getPresetHint(FONT_PRESETS, input.fontPresetId);
    const colorSchemeHint = getPresetHint(COLOR_SCHEMES, input.colorSchemeId);
    const styleLine = userStyleOverride
      ? `Additional style override from user: ${userStyleOverride}`
      : "";

    const prompt = [
      "Create an enterprise marketing visual for Cendien.",
      CENDIEN_CONTEXT,
      `Title: ${brandedTitle}`,
      `Body context: ${draft.body}`,
      draft.painPoints.length > 0 ? `Target pain points: ${draft.painPoints.join(" | ")}` : "",
      stylePresetHint ? `Style preset: ${stylePresetHint}` : "Style preset: professional enterprise marketing visual.",
      fontPresetHint ? `Font preset: ${fontPresetHint}` : "",
      colorSchemeHint ? `Color scheme preset: ${colorSchemeHint}` : "",
      styleLine,
      categoryContext,
      brandGuard,
      "Use the provided Cendien logo as a visual reference and integrate it delicately.",
      "Logo usage guidance: small-to-moderate size, clean placement, non-distracting, keep composition premium.",
      "Preserve Cendien brand-safe and enterprise-appropriate quality.",
      "If any headline/title text appears in the image, it must include the exact word 'Cendien'.",
      `Aspect ratio: ${input.aspectRatio}`,
      `Resolution preference: ${input.imageResolution}`
    ].join("\n");

    const model = env.GEMINI_IMAGE_MODEL;
    const modelClient = this.ai.models as any;

    let uri: string;
    let usedReferenceImages = false;
    if (this.isGeminiModel(model)) {
      const referenceParts = await this.getReferenceParts(category, input);
      usedReferenceImages = referenceParts.length > 0;
      const contents = referenceParts.length > 0
        ? [
          {
            role: "user",
            parts: [{ text: prompt }, ...referenceParts.map((part) => ({ inlineData: part }))]
          }
        ]
        : prompt;

      const response = await modelClient.generateContent({
        model,
        contents,
        config: {
          responseModalities: [Modality.IMAGE],
          imageConfig: {
            aspectRatio: input.aspectRatio,
            imageSize: input.imageResolution
          },
          temperature: 1
        }
      });

      const parts = response?.candidates?.[0]?.content?.parts;
      const imagePart = Array.isArray(parts)
        ? parts.find((part: any) => typeof part?.inlineData?.data === "string" || part?.fileData?.fileUri)
        : undefined;

      if (imagePart?.inlineData?.data) {
        const mime = String(imagePart.inlineData.mimeType ?? "image/jpeg");
        uri = `data:${mime};base64,${imagePart.inlineData.data}`;
      } else if (imagePart?.fileData?.fileUri) {
        uri = String(imagePart.fileData.fileUri);
      } else {
        throw new Error("Image generation returned no image data.");
      }
    } else {
      const response = await modelClient.generateImages({
        model,
        prompt,
        config: {
          aspectRatio: this.toImagenAspectRatio(input.aspectRatio),
          imageSize: this.toImagenImageSize(input.imageResolution)
        }
      });

      const first = response?.generatedImages?.[0]?.image;
      if (first?.imageBytes) {
        uri = `data:image/png;base64,${first.imageBytes}`;
      } else if (first?.uri) {
        uri = String(first.uri);
      } else {
        throw new Error("Image generation returned no image data.");
      }
    }

    const generationMs = Date.now() - startedAt;

    return {
      result: {
        id: createId(),
        runId,
        type: "image",
        uri,
        modelId: env.GEMINI_IMAGE_MODEL,
        generationMs,
        createdAt: nowIso()
      },
      meta: {
        model: env.GEMINI_IMAGE_MODEL,
        prompt,
        generationMs,
        aspectRatio: input.aspectRatio,
        imageResolution: input.imageResolution,
        hasReferenceImages: usedReferenceImages
      }
    };
  }

  private isGeminiModel(model: string): boolean {
    return /(^|\/)gemini-/i.test(model);
  }

  private ensureCendienInTitle(title: string): string {
    const normalized = title.trim();
    if (!normalized) {
      return "Cendien enterprise innovation";
    }
    if (/\bcendien\b/i.test(normalized)) {
      return normalized;
    }
    return `Cendien: ${normalized}`;
  }

  private toImagenAspectRatio(aspectRatio: RunInput["aspectRatio"]): string {
    const supported = new Set(["1:1", "3:4", "4:3", "9:16", "16:9"]);
    return supported.has(aspectRatio) ? aspectRatio : "16:9";
  }

  private toImagenImageSize(imageResolution: RunInput["imageResolution"]): string {
    const supported = new Set(["1K", "2K"]);
    return supported.has(imageResolution) ? imageResolution : "2K";
  }

  private async getReferenceParts(category: Category, input: RunInput): Promise<InlineImagePart[]> {
    const parts: InlineImagePart[] = [];
    const maxReferences = 14;

    const logoPart = await this.getLogoPart();
    if (logoPart) {
      parts.push(logoPart);
    }

    if (category === "infor") {
      const inforPart = await this.getInforLogoPart();
      if (inforPart) {
        parts.push(inforPart);
      }
    }

    if (category === "team") {
      const teamPart = await this.getTeamReferencePart();
      if (teamPart) {
        parts.push(teamPart);
      }
    }

    const remainingSlots = Math.max(0, maxReferences - parts.length);
    if (remainingSlots > 0 && this.libraryService && input.referenceAssetIds?.length) {
      const selectedParts = await this.libraryService.getReferenceParts(input.referenceAssetIds, remainingSlots);
      parts.push(...selectedParts);
    }

    return parts;
  }

  private async getLogoPart(): Promise<InlineImagePart | undefined> {
    if (!this.logoPartPromise) {
      const logoPath = env.CENDIEN_LOGO_PATH ?? defaultLogoPath;
      this.logoPartPromise = this.loadImagePart(logoPath, "Cendien logo");
    }
    return this.logoPartPromise;
  }

  private async getInforLogoPart(): Promise<InlineImagePart | undefined> {
    if (!this.inforLogoPartPromise) {
      this.inforLogoPartPromise = this.loadImagePart(defaultInforLogoPath, "Infor logo");
    }
    return this.inforLogoPartPromise;
  }

  private async getTeamReferencePart(): Promise<InlineImagePart | undefined> {
    if (!this.teamReferencePartPromise) {
      this.teamReferencePartPromise = this.loadTeamReferencePart();
    }
    return this.teamReferencePartPromise;
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
      return this.loadImagePart(path.join(defaultTeamReferenceDir, first), `team reference image ${first}`);
    } catch (error) {
      console.warn(
        `Team reference image could not be loaded from ${defaultTeamReferenceDir}. Image generation will continue without team reference.`,
        error
      );
      return undefined;
    }
  }

  private async loadImagePart(filePath: string, label: string): Promise<InlineImagePart | undefined> {
    try {
      const bytes = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      return {
        mimeType,
        data: bytes.toString("base64")
      };
    } catch (error) {
      console.warn(
        `${label} could not be loaded from ${filePath}. Image generation will continue without this reference.`,
        error
      );
      return undefined;
    }
  }
}
