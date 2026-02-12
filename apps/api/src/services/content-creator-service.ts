import type { Category, Citation, ContentDraft, Tone } from "@marketing/shared";
import { env } from "../config/env.js";
import { CENDIEN_CONTENT_GOAL, CENDIEN_CONTEXT, buildPainPointContext } from "../agents/prompts/brand-context.js";
import { categoryGuidance, tonePromptByTone } from "../agents/prompts/tone-prompts.js";
import { buildGroundingTools, createGeminiClient } from "./gemini-grounding.js";
import { extractGroundingCitations } from "./grounding-citations.js";

export interface ContentInput {
  tone: Tone;
  category: Category;
  newsTopic: string;
  newsSummary: string;
  manualIdeaText?: string;
  groundingSnippet: string;
  citations: Citation[];
}

export interface ContentGenerationOutput {
  result: ContentDraft;
  meta: {
    model: string;
    prompt: string;
    rawResponseText: string | undefined;
    systemInstruction: string;
    groundingDiagnostics?: string;
  };
}

export class ContentCreatorService {
  private ai = createGeminiClient();

  async generateDraft(input: ContentInput): Promise<ContentGenerationOutput> {
    if (!this.ai) {
      throw new Error("Vertex client is required. Set VERTEX_GCLOUD_PROJECT for grounded content generation.");
    }

    const systemInstruction = [
      "You are a senior B2B marketing strategist and copywriter for Cendien.",
      CENDIEN_CONTEXT,
      CENDIEN_CONTENT_GOAL,
      "All output must be written as Cendien-branded thought leadership for enterprise decision-makers.",
      "Do not produce generic content detached from Cendien positioning.",
      "Grounding policy: The answer must be based on Grounded data from the configured grounding tool.",
      "Do not invent sources, claims, or citations."
    ].join(" ");

    const painPointContext = buildPainPointContext();

    const prompt = [
      "You are a B2B marketing writer for Cendien.",
      tonePromptByTone[input.tone],
      categoryGuidance[input.category],
      `Topic: ${input.newsTopic}`,
      `Summary: ${input.newsSummary}`,
      input.manualIdeaText ? `Manual user idea: ${input.manualIdeaText}` : "",
      `Grounding context: ${input.groundingSnippet}`,
      `Citations input: ${JSON.stringify(input.citations)}`,
      "",
      "=== Buyer Pain Points (use these to frame the post) ===",
      "Connect the topic to one or more of these real buyer pain points. Use the buyer's own language when possible.",
      painPointContext,
      "",
      "The painPoints field in the output must reference specific pain points from the list above that this post addresses.",
      "",
      "Grounding requirement: You must use grounding tool results and prioritize those facts.",
      "Length requirement: the combined body text (hook + body + cta) must be 150-300 words. This is a LinkedIn post, not a blog article.",
      "Title requirement: include the exact word 'Cendien' in the title.",
      "Output format contract (strict): return ONLY one JSON object and nothing else.",
      'Use exactly this shape: {"title":"string","hook":"string","body":"string","cta":"string","painPoints":["string"],"category":"string"}',
      `Category must be exactly: "${input.category}".`,
      "Do not wrap in markdown. Do not use code fences. Do not add commentary."
    ]
      .filter(Boolean)
      .join("\n");

    const response = await this.ai.models.generateContent({
      model: env.GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: buildGroundingTools() as any,
        systemInstruction,
        temperature: 1,
        maxOutputTokens: 5000
      }
    });

    const text = this.extractText(response);
    if (!text) {
      throw new Error("Gemini returned empty response for content draft.");
    }

    const parsed = this.tryParseJson(text);
    if (!parsed) {
      console.warn("Unparseable Gemini response for content draft. Continuing with fallback extraction.");
    }

    const diagnostics = this.describeGroundingDiagnostics(response);
    const groundedCitations = extractGroundingCitations(response);
    if (groundedCitations.length === 0) {
      console.warn(
        "Vertex grounding returned no citations for content draft. Continuing with draft and empty citations.",
        diagnostics
      );
    }
    const citations = groundedCitations.length > 0 ? this.mergeCitations(groundedCitations) : [];

    const draft: ContentDraft = {
      title: this.ensureCendienInTitle(
        String(parsed?.title ?? this.inferTitleFromText(text) ?? "Cendien market signal your buyers are reacting to this week")
      ),
      hook: String(parsed?.hook ?? "Teams that prove value faster are winning pipeline."),
      body: String(parsed?.body ?? this.fallbackBodyFromText(text, input.newsSummary)),
      cta: String(parsed?.cta ?? "Comment if you want a practical checklist."),
      painPoints: Array.isArray(parsed?.painPoints)
        ? parsed!.painPoints.map((value: unknown) => String(value))
        : ["Slow execution", "Unclear ROI"],
      citations,
      category:
        typeof parsed?.category === "string" && parsed.category.trim().length > 0
          ? (parsed.category.trim() as Category)
          : input.category
    };

    return {
      result: draft,
      meta: {
        model: env.GEMINI_TEXT_MODEL,
        prompt,
        rawResponseText: text,
        systemInstruction,
        groundingDiagnostics: diagnostics
      }
    };
  }

  private ensureCendienInTitle(title: string): string {
    const normalized = title.trim();
    if (!normalized) {
      return "Cendien enterprise market update";
    }
    if (/\bcendien\b/i.test(normalized)) {
      return normalized;
    }
    return `Cendien: ${normalized}`;
  }

  private mergeCitations(citations: Citation[]): Citation[] {
    const bySource = new Map<string, Citation>();
    for (const citation of citations) {
      if (!citation.sourceUrl) {
        continue;
      }
      const key = citation.sourceUrl.trim();
      if (!key) {
        continue;
      }
      const normalized: Citation = {
        sourceUrl: key,
        snippet: citation.snippet?.trim() || "Grounded source document",
        confidence: Number.isFinite(citation.confidence) ? Math.max(0, Math.min(1, citation.confidence)) : 0.7
      };
      const existing = bySource.get(key);
      if (!existing || normalized.confidence > existing.confidence || normalized.snippet.length > existing.snippet.length) {
        bySource.set(key, normalized);
      }
    }
    return [...bySource.values()];
  }

  private describeGroundingDiagnostics(response: any): string {
    const candidates = Array.isArray(response?.candidates) ? response.candidates : [];
    if (candidates.length === 0) {
      return "Diagnostics: no response candidates.";
    }

    const summary = candidates
      .slice(0, 2)
      .map((candidate: any, index: number) => {
        const groundingChunks = Array.isArray(candidate?.groundingMetadata?.groundingChunks)
          ? candidate.groundingMetadata.groundingChunks.length
          : 0;
        const groundingSupports = Array.isArray(candidate?.groundingMetadata?.groundingSupports)
          ? candidate.groundingMetadata.groundingSupports.length
          : 0;
        const retrievalQueries = Array.isArray(candidate?.groundingMetadata?.retrievalQueries)
          ? candidate.groundingMetadata.retrievalQueries.length
          : 0;
        const citationMetadata = Array.isArray(candidate?.citationMetadata?.citations)
          ? candidate.citationMetadata.citations.length
          : 0;
        return `candidate[${index}] chunks=${groundingChunks}, supports=${groundingSupports}, retrievalQueries=${retrievalQueries}, citationMetadata=${citationMetadata}`;
      })
      .join("; ");

    return `Diagnostics: ${summary}`;
  }

  private inferTitleFromText(text: string): string | undefined {
    const firstLine = text
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean);
    if (!firstLine) {
      return undefined;
    }
    return firstLine.replace(/^#+\s*/, "").slice(0, 120).trim();
  }

  private fallbackBodyFromText(text: string, newsSummary: string): string {
    const trimmed = text.trim();
    if (!trimmed) {
      return newsSummary;
    }
    return trimmed.length > 2400 ? `${trimmed.slice(0, 2400)}...` : trimmed;
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
          .filter((p: any) => typeof p?.text === "string")
          .map((p: any) => p.text);
        if (textParts.length > 0) {
          return textParts.join("");
        }
      }
    }

    return undefined;
  }

  private tryParseJson(text: string): Record<string, any> | undefined {
    if (!text.trim()) {
      return undefined;
    }

    try {
      return JSON.parse(text);
    } catch {
      const jsonCandidate = text.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonCandidate) {
        return undefined;
      }
      try {
        return JSON.parse(jsonCandidate);
      } catch {
        return undefined;
      }
    }
  }
}
