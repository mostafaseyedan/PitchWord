import type { Category, Citation, Tone } from "@marketing/shared";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { CENDIEN_CONTENT_GOAL, CENDIEN_CONTEXT } from "../agents/prompts/brand-context.js";

export interface NewsResult {
  topic: string;
  summary: string;
  citations: Citation[];
}

export interface NewsDiscoveryOutput {
  result: NewsResult;
  meta: {
    model: string;
    prompt: string;
    rawResponseText: string | undefined;
    systemInstruction: string;
  };
}

export class NewsHunterService {
  private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;

  async discover(topicHint: string | undefined, tone: Tone, category: Category): Promise<NewsDiscoveryOutput> {
    if (topicHint?.trim()) {
      return {
        result: {
          topic: topicHint.trim(),
          summary: `Manual topic selected: ${topicHint.trim()}`,
          citations: []
        },
        meta: {
          model: "none",
          prompt: "",
          rawResponseText: undefined,
          systemInstruction: ""
        }
      };
    }

    if (!this.ai) {
      throw new Error("Gemini API key is required for news discovery. Set GEMINI_API_KEY.");
    }

    const systemInstruction = [
      "You are a senior news intelligence analyst specializing in technology, artificial intelligence, and enterprise software markets.",
      CENDIEN_CONTEXT,
      CENDIEN_CONTENT_GOAL,
      "Treat Cendien as the primary brand and audience context for topic selection.",
      "Your primary focus is tech and AI developments — product launches, funding rounds, regulatory shifts, major partnerships, and breakthrough research.",
      "You should also surface major global and political news when it has a direct or significant impact on business, technology adoption, or enterprise markets.",
      "Always prioritize recency, credibility, and business relevance.",
      "Only use sources from trusted publications. Never fabricate or hallucinate sources."
    ].join(" ");

    const prompt = [
      "Find one high-impact, recent news topic relevant to B2B technology and enterprise markets.",
      `Category focus: ${category}`,
      `Tone preference for downstream writing: ${tone}`,
      "The chosen topic must be clearly connectable to Cendien offerings (ITSM, Microsoft, Infor, enterprise operations).",
      "Prioritize credible, primary, and recent sources.",
      "Return plain text only.",
      "Format:",
      "1) First line: short topic title (max 12 words).",
      "2) Then 2-3 sentences summarizing the development and its business impact.",
      "Do not include links, citations, markdown, or JSON."
    ].join("\n");

    const response = await this.ai.models.generateContent({
      model: env.GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] as any,
        systemInstruction,
        temperature: 1,
        maxOutputTokens: 2000
      }
    });

    const text = this.extractText(response);
    if (!text) {
      throw new Error("Gemini returned empty response for news discovery.");
    }

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const topic = this.cleanTopic(lines[0] ?? "Market update");
    const summary = this.cleanSummary(lines.slice(1).join(" ").trim() || text.trim());

    return {
      result: {
        topic,
        summary,
        citations: []
      },
      meta: {
        model: env.GEMINI_TEXT_MODEL,
        prompt,
        rawResponseText: text,
        systemInstruction
      }
    };
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

  private cleanTopic(value: string): string {
    return value
      .replace(/^#+\s*/, "")
      .replace(/^topic\s*:\s*/i, "")
      .trim();
  }

  private cleanSummary(value: string): string {
    return value
      .replace(/^summary\s*:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}
