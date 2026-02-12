import { GoogleGenAI, Modality } from "@google/genai";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Asset, Category, ContentDraft, RunInput } from "@marketing/shared";
import { CENDIEN_CONTEXT } from "../agents/prompts/brand-context.js";
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
    const categoryVisualStyle = this.buildCategoryVisualStyle(category, draft);
    const styleLine = userStyleOverride
      ? `Additional style override from user: ${userStyleOverride}`
      : "";

    const prompt = [
      "Create an enterprise marketing visual for Cendien.",
      CENDIEN_CONTEXT,
      `Title: ${brandedTitle}`,
      `Hook: ${draft.hook}`,
      `Body context: ${draft.body}`,
      `CTA intent: ${draft.cta}`,
      draft.painPoints.length > 0 ? `Target pain points: ${draft.painPoints.join(" | ")}` : "",
      `Category visual style:\n${categoryVisualStyle}`,
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
      const referenceParts = await this.getReferenceParts(category);
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

  private buildCategoryVisualStyle(category: Category, draft: ContentDraft): string {
    switch (category) {
      case "team":
        return [
          "Create a single professional group photo that looks like everyone was physically together.",
          "Scene: Modern office conference room with large windows and a city view. Natural afternoon light entering from the left.",
          "Arrange all people around a conference table in a natural meeting pose: some sitting, one standing and presenting, casual but professional.",
          "Match lighting direction and intensity across all faces. Keep each person’s outfit, hairstyle, and appearance exactly as in their reference photo.",
          "Ensure shadows, reflections on the table, and perspective are consistent.",
          "The final image should look like a real corporate photo, not a collage.",
          "4K resolution, landscape orientation."
        ].join("\n");
      case "product_education":
        return [
          "Create a high-quality, realistic 3D render of exactly one instance of the object: [Highend AI server rack].",
          "The object must float freely in mid-air and be gently tilted and rotated in 3D space (not front-facing).",
          "Use a soft, minimalist dark background in a clean 1080x1080 composition.",
          "Left Half — Full Realism",
          "The left half of the object should appear exactly as it looks in real life — accurate materials, colors, textures, reflections, and proportions.",
          "This half must be completely opaque with no transparency and no wireframe overlay.",
          "No soft transition, no fading, no blending.",
          "Right Half — Hard Cut Wireframe Interior",
          "The right half must switch cleanly to a wireframe interior diagram.",
          "The boundary between the two halves must be a perfectly vertical, perfectly sharp, crisp cut line, stretching straight from the top edge to the bottom edge of the object.",
          "No diagonal edges, no curved slicing, no gradient.",
          "The wireframe must use only two line colors:",
          "Primary: white (approximately 80% of all lines).",
          "Secondary: a color sampled from the dominant color of the realistic half (less than 20% of lines).",
          "The wireframe lines must be thin, precise, aligned, and engineering-style.",
          "Every wireframe component must perfectly match the geometry of the object.",
          "Strict Single-Object Rule",
          "Render only ONE object in the entire frame. Render only one physical object.",
          "Do NOT show a second object from any angle.",
          "Do NOT show a second object as a reflection, shadow, silhouette, outline, ghost image, or transparency.",
          "Do NOT show a second object for comparison or display purposes.",
          "Do NOT show both the front and the back separately.",
          "Do NOT show an extra device behind, beside, underneath, or partially hidden.",
          "No duplicate objects, no mirrored back-and-front pairings, no reflections showing a second object.",
          "The object must appear alone, floating.",
          "Pose & Lighting:",
          "Apply a natural, subtle tilt + rotation in 3D to make it look like a floating product visualization.",
          "Use soft, neutral global illumination and no shadows under the object.",
          "No extra props, no text, no labels unless explicitly requested."
        ].join("\n");
      case "customer_pain_point":
        return [
          `Vintage blueprint infographic explaining this draft content: ${draft.title} | ${draft.hook} | ${draft.body}`,
          "Technical annotations, isometric elements, sepia overlay on white, labeled arrows.",
          "Design language should feel like an engineering incident-analysis board translated into executive storytelling.",
          "Blend operational bottlenecks, system flow constraints, and remediation callouts into one coherent visual."
        ].join("\n");
      case "industry_news":
        return [
          "Editorial enterprise-news hero visual with cinematic realism.",
          "Show a modern command center overlooking a skyline, with layered holographic data panels representing market movement and technology disruption.",
          "Use strong directional lighting, high contrast, and sharp depth separation to create urgency and authority.",
          "Composition should feel like the cover of a top-tier business technology report.",
          "No clutter, no cartoon style, no meme aesthetics."
        ].join("\n");
      case "company_update":
        return [
          "Premium corporate announcement visual for a strategic company update.",
          "Scene: executive briefing environment with architectural lines, polished surfaces, and subtle motion cues suggesting progress.",
          "Include abstract motifs of transformation, delivery confidence, and cross-functional execution.",
          "Color treatment should be clean and brand-safe, with a modern enterprise finish suitable for LinkedIn thought leadership."
        ].join("\n");
      case "hiring":
        return [
          "Create a recruiting campaign visual that feels elite, human, and aspirational.",
          "Scene: contemporary tech office with diverse professionals collaborating around digital planning surfaces.",
          "Emphasize growth, mentorship, and technical excellence with authentic expressions and realistic body language.",
          "Use natural lighting and premium photography style.",
          "No stock-photo stiffness, no exaggerated poses, no cheesy hiring tropes."
        ].join("\n");
      case "infor":
        return [
          "Create a strategic enterprise integration visual highlighting Cendien + Infor partnership value.",
          "Scene: a high-end operations environment where business workflow, ERP orchestration, and IT service continuity are visually connected.",
          "Use layered interface-like elements to imply planning, execution, and optimization across finance, supply chain, and service operations.",
          "Infor presence should be secondary and tasteful, while Cendien remains the lead brand anchor.",
          "Final image must feel boardroom-ready and implementation-focused."
        ].join("\n");
      default: {
        const exhaustive: never = category;
        return exhaustive;
      }
    }
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

  private async getReferenceParts(category: Category): Promise<InlineImagePart[]> {
    const parts: InlineImagePart[] = [];

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
