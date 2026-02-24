import type { Category, Citation, Tone } from "@marketing/shared";
import type { ContentCreatorService } from "./content-creator-service.js";
import type { NewsHunterService } from "./news-hunter-service.js";

export interface RunPromptGeneratePayload {
  category: Category;
  tone: Tone;
  topicHint?: string;
  stylePresetId?: string;
}

export class RunPromptService {
  constructor(
    private readonly newsHunterService: NewsHunterService,
    private readonly contentCreatorService: ContentCreatorService
  ) {}

  async generatePrompts(payload: RunPromptGeneratePayload): Promise<string[]> {
    const { category, tone, topicHint } = payload;
    const startedAt = Date.now();

    console.log(
      `[run-prompt] start category=${category} tone=${tone} topicHint=${!!topicHint}`
    );

    let newsTopic: string;
    let newsSummary: string;
    let newsCitations: Citation[];

    if (category === "industry_news") {
      // 1 Google Search call via Gemini API key
      if (topicHint) {
        newsTopic = topicHint;
        newsSummary = topicHint;
        newsCitations = [];
      } else {
        const newsOutput = await this.newsHunterService.discover(undefined, tone, category);
        newsTopic = newsOutput.result.topic;
        newsSummary = newsOutput.result.summary;
        newsCitations = newsOutput.result.citations;
      }
    } else {
      // All other categories: category drives the Vertex AI grounding query.
      // topicHint is a separate focus hint passed via manualIdeaText — not a topic override.
      // Vertex AI Search grounding happens inside generateDrafts — 1 Vertex AI call total.
      newsTopic = `Cendien ${category.replace(/_/g, " ")}`;
      newsSummary = newsTopic;
      newsCitations = [];
    }

    // Single ContentCreator call returning 6 draft variations.
    // Vertex AI Search grounding is applied inside the Gemini call via buildGroundingTools().
    const drafts = await this.contentCreatorService.generateDrafts({
      tone,
      category,
      newsTopic,
      newsSummary,
      manualIdeaText: topicHint,
      groundingSnippet: newsSummary,
      citations: newsCitations
    }, 6);

    const seen = new Set<string>();
    const prompts: string[] = [];
    for (const draft of drafts) {
      const key = draft.body.replace(/\s+/g, " ").trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        prompts.push(`${draft.title}\n\n${draft.body}`);
      }
    }

    console.log(
      `[run-prompt] done elapsed_ms=${Date.now() - startedAt} returned_count=${prompts.length}`
    );

    return prompts.slice(0, 6);
  }
}
