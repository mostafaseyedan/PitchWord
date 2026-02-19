import { GoogleGenAI } from "@google/genai";
import type { GraphicTopicGenerateRequest } from "@marketing/shared";
import { env } from "../config/env.js";
import { COLOR_SCHEMES, FONT_PRESETS, GRAPHIC_STYLE_PRESETS, resolveStyleHint } from "./visual-presets.js";
import type { FontPreset, ColorSchemePreset } from "./visual-presets.js";

export class GraphicTopicService {
  private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;
  private readonly promptLinePrefix = "PROMPT::";

  async generatePrompts(payload: GraphicTopicGenerateRequest): Promise<string[]> {
    if (!this.ai) {
      throw new Error("Gemini client is not configured. Set GEMINI_API_KEY for topic generation.");
    }

    const stylePreset = GRAPHIC_STYLE_PRESETS.find((item) => item.id === payload.stylePresetId);
    const fontPreset = (FONT_PRESETS as FontPreset[]).find((item) => item.id === payload.fontPresetId);
    const colorPreset = (COLOR_SCHEMES as ColorSchemePreset[]).find((item) => item.id === payload.colorSchemeId);
    const styleHint = stylePreset ? resolveStyleHint(stylePreset.promptHint, fontPreset, colorPreset)?.trim() : undefined;
    const fontHint = fontPreset?.promptHint?.trim() || undefined;
    const colorHint = colorPreset?.promptHint?.trim() || undefined;
    const topicHint = payload.topicHint?.trim();

    const prompt = [
      "Generate exactly 6 graphic-generation prompts for a Cendien enterprise marketing visual.",
      "Keep it specific, concrete, and production-ready.",
      "No markdown, bullets, numbering, preambles, or extra commentary.",
      "Do not output instruction templates or labels like PAGE STYLE, STRUCTURE REQUIREMENTS, VISUAL RULES, MUST INCLUDE, or Section 1/2/3.",
      "",
      "Output format rules (strict):",
      `- Return exactly 6 prompt blocks.`,
      `- Start each block with '${this.promptLinePrefix}' on the first line.`,
      "- A prompt can continue on multiple lines after its first line.",
      `- Use the next '${this.promptLinePrefix}' marker to start the next prompt block.`,
      "- Do not include any text before the first marker or after the sixth prompt block.",
      "",
      "Example output format:",
      "PROMPT:: Minimalist vector icon of interconnected nodes in executive blue for enterprise data orchestration.",
      "Use crisp line weight and balanced negative space with enterprise polish.",
      "PROMPT:: Flat infographic layout showing challenge-solution-outcome sequence with concise enterprise visual hierarchy.",
      "Prioritize clear visual scanning and restrained corporate styling.",
      "",
      stylePreset?.label ? `Selected style preset: ${stylePreset.label}.` : "",
      styleHint ? `Style guidance (summary): ${styleHint}` : "",
      fontPreset?.label ? `Selected font preset: ${fontPreset.label}.` : "",
      fontHint ? `Font guidance (summary): ${fontHint}` : "",
      colorPreset?.label ? `Selected color preset: ${colorPreset.label}.` : "",
      colorHint ? `Color guidance (summary): ${colorHint}` : "",
      topicHint ? `Optional user hint: ${topicHint}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    const startedAt = Date.now();
    console.log(
      `[graphic-topic] gemini_call_start model=${env.GEMINI_TEXT_MODEL} style=${payload.stylePresetId ?? "none"} font=${payload.fontPresetId ?? "none"} color=${payload.colorSchemeId ?? "none"} has_topic_hint=${topicHint ? "yes" : "no"}`
    );

    let response: any;
    try {
      response = await this.ai.models.generateContent({
        model: env.GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            "You are a senior enterprise creative director. Follow output format exactly. Return only the requested prompt lines and nothing else.",
          temperature: 1,
          maxOutputTokens: 20480
        }
      });
    } catch (error: any) {
      const elapsedMs = Date.now() - startedAt;
      console.error(
        `[graphic-topic] gemini_call_error model=${env.GEMINI_TEXT_MODEL} elapsed_ms=${elapsedMs} error=${error?.message ?? String(error)}`
      );
      throw error;
    }

    const text = this.extractText(response);
    if (!text || !text.trim()) {
      throw new Error("Gemini returned no usable prompts.");
    }

    console.log("[graphic-topic] gemini_raw_response_start");
    console.log(text);
    console.log("[graphic-topic] gemini_raw_response_end");

    const prompts = this.parsePromptsFromText(text);
    if (prompts.length === 0) {
      throw new Error("Gemini returned no parseable prompts.");
    }

    const totalElapsedMs = Date.now() - startedAt;
    console.log(
      `[graphic-topic] gemini_call_done model=${env.GEMINI_TEXT_MODEL} elapsed_ms=${totalElapsedMs} raw_char_count=${text.length} returned_count=${prompts.length}`
    );

    return prompts.slice(0, 6);
  }

  private parsePromptsFromText(text: string): string[] {
    const normalized = text.replace(/\r\n/g, "\n");
    const lines = normalized.split("\n");
    const blocks: string[] = [];
    let current: string[] | null = null;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (trimmed.toUpperCase().startsWith(this.promptLinePrefix)) {
        if (current && current.join("\n").trim()) {
          blocks.push(current.join("\n").trim());
        }
        current = [trimmed.slice(this.promptLinePrefix.length).trim()];
        continue;
      }

      if (current) {
        current.push(trimmed);
      }
    }

    if (current && current.join("\n").trim()) {
      blocks.push(current.join("\n").trim());
    }

    if (blocks.length > 0) {
      return Array.from(new Map(blocks.map((block) => [this.dedupeKey(block), block])).values());
    }

    // Fallback for mildly non-compliant model output.
    const plainLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return Array.from(new Map(plainLines.map((line) => [this.dedupeKey(line), line])).values());
  }

  private dedupeKey(value: string): string {
    return value.replace(/\s+/g, " ").trim().toLowerCase();
  }



  private extractText(response: any): string | undefined {
    try {
      if (response?.text) {
        return response.text;
      }
    } catch {
      // .text is a getter that can throw
    }

    const candidates = response?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      const parts = candidates[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const textParts = parts
          .filter((part: any) => typeof part?.text === "string")
          .map((part: any) => part.text);
        if (textParts.length > 0) {
          return textParts.join("");
        }
      }
    }

    return undefined;
  }
}
