import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GraphicGenerateRequest, ImageResolution, LibraryAsset } from "@marketing/shared";
import { env } from "../config/env.js";
import { LibraryService } from "./library-service.js";
import { COLOR_SCHEMES, FONT_PRESETS, getPresetHint, getResolvedStyleHint, GRAPHIC_STYLE_PRESETS } from "./visual-presets.js";

export class GraphicGenerationService {
  private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;

  constructor(private readonly libraryService: LibraryService) { }

  async generate(payload: GraphicGenerateRequest): Promise<LibraryAsset> {
    if (!this.ai) {
      throw new Error("Gemini client is not configured. Set GEMINI_API_KEY for graphic generation.");
    }

    const maxReferences = 14;
    const referenceParts = await this.libraryService.getReferenceParts(payload.referenceAssetIds ?? [], maxReferences);
    const styleHint = getResolvedStyleHint(GRAPHIC_STYLE_PRESETS, payload.stylePresetId, payload.fontPresetId, payload.colorSchemeId);
    const styleOverride = payload.styleOverride?.trim();
    const fontHint = getPresetHint(FONT_PRESETS, payload.fontPresetId);
    const colorHint = getPresetHint(COLOR_SCHEMES, payload.colorSchemeId);

    const promptParts = [
      "Create a professional graphic asset for Cendien.",
      payload.prompt,
    ];

    if (styleOverride) {
      promptParts.push(`Visual Design Instructions (CRITICAL OVERRIDE): ${styleOverride}`);
    } else {
      if (styleHint) promptParts.push(`Style preset: ${styleHint}`);
      if (fontHint) promptParts.push(`Font preset: ${fontHint}`);
      if (colorHint) promptParts.push(`Color scheme preset: ${colorHint}`);
    }

    promptParts.push(
      "No logos other than Cendien-compatible enterprise styling.",
      `Aspect ratio: ${payload.aspectRatio}`,
      `Resolution preference: ${payload.imageResolution}`
    );

    const prompt = promptParts.filter(Boolean).join("\n");

    const contents = referenceParts.length > 0
      ? [
        {
          role: "user",
          parts: [{ text: prompt }, ...referenceParts.map((part) => ({ inlineData: part }))]
        }
      ]
      : prompt;

    const response = await (this.ai.models as any).generateContent({
      model: env.GEMINI_IMAGE_MODEL,
      contents,
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          aspectRatio: payload.aspectRatio,
          imageSize: payload.imageResolution
        },
        temperature: 1
      }
    });

    const parts = response?.candidates?.[0]?.content?.parts;
    const imagePart = Array.isArray(parts)
      ? parts.find((part: any) => typeof part?.inlineData?.data === "string" || part?.fileData?.fileUri)
      : undefined;

    let uri: string;
    let mimeTypeHint: string | undefined;
    if (imagePart?.inlineData?.data) {
      mimeTypeHint = String(imagePart.inlineData.mimeType ?? "image/png");
      uri = `data:${mimeTypeHint};base64,${imagePart.inlineData.data}`;
    } else if (imagePart?.fileData?.fileUri) {
      uri = String(imagePart.fileData.fileUri);
    } else {
      throw new Error("Graphic generation returned no image data.");
    }

    return this.libraryService.saveGeneratedAsset({
      uri,
      title: this.buildTitle(payload.prompt),
      mimeTypeHint,
      prompt: payload.prompt,
      styleInstructions: styleOverride || styleHint
    });
  }

  // Keep this mapping identical to existing image-generation constraints.
  toSupportedAspectRatio(value: AspectRatio): AspectRatio {
    return value;
  }

  toSupportedImageResolution(value: ImageResolution): ImageResolution {
    return value === "4K" ? "2K" : value;
  }

  private buildTitle(prompt: string): string {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return "Generated Graphic";
    }
    return trimmed.length > 80 ? `${trimmed.slice(0, 80)}...` : trimmed;
  }
}
