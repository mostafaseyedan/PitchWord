import { GoogleGenAI } from "@google/genai";
import type { Category, Tone } from "@marketing/shared";
import { CENDIEN_CONTEXT } from "../agents/prompts/brand-context.js";
import { env } from "../config/env.js";
import { NewsHunterService } from "./news-hunter-service.js";
import { STYLE_PRESETS, getPresetHint } from "./visual-presets.js";

export interface RunPromptGeneratePayload {
    category: Category;
    tone: Tone;
    topicHint?: string;
    stylePresetId?: string;
}

const promptLinePrefix = "PROMPT::";

const categoryDescriptions: Record<Category, string> = {
    industry_news: "Recent enterprise technology developments affecting ITSM, Microsoft, and Infor markets.",
    customer_pain_point: "Recurring IT consulting pain points like skills gaps, upgrade fatigue, or key-person dependency.",
    company_update: "Cendien project win, delivery milestone, or capability expansion.",
    hiring: "Cendien team growth needs with clear role and value framing for ITSM, Microsoft, or Infor consulting.",
    product_education: "Practical how-to angle for ITSM, Microsoft, or Infor concept.",
    infor: "Infor ERP modernization, integration challenges, and operational transformation.",
    team: "Cendien team members, culture, expertise, and trusted delivery capability.",
};

export class RunPromptService {
    private ai = env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }) : undefined;
    private newsHunterService = new NewsHunterService();

    async generatePrompts(payload: RunPromptGeneratePayload): Promise<string[]> {
        if (!this.ai) {
            throw new Error("Gemini client is not configured. Set GEMINI_API_KEY for prompt generation.");
        }

        let groundedNewsSummary: string | undefined;

        // For industry_news category, do a live news hunt to ground the prompts
        if (payload.category === "industry_news") {
            try {
                const newsOutput = await this.newsHunterService.discover(
                    payload.topicHint,
                    payload.tone,
                    payload.category
                );
                groundedNewsSummary = `News topic: ${newsOutput.result.topic}. Summary: ${newsOutput.result.summary}`;
            } catch (err) {
                // If news hunt fails, fall through to non-grounded generation
                console.warn("[run-prompt] news hunt failed, proceeding without grounding:", err);
            }
        }

        const styleHint = payload.stylePresetId
            ? getPresetHint(STYLE_PRESETS, payload.stylePresetId)
            : undefined;

        const categoryDesc = categoryDescriptions[payload.category];

        const systemInstruction = [
            "You are a senior enterprise creative director at Cendien.",
            CENDIEN_CONTEXT,
            "Your job is to generate exactly 4 enterprise marketing image promptss.",
            "Each prompt is a full, self-contained visual description that will be sent directly to an AI image generation model.",
            "Each prompt should describe: the scene/subject matter, the visual style, composition, lighting, and atmosphere.",
            "Keep prompts specific, production-ready, and enterprise-appropriate.",
            "Follow the output format exactly. Return only the requested prompt lines and nothing else.",
        ].join(" ");

        const promptLines = [
            `Generate exactly 4 distinct enterprise marketing image prompts for Cendien.`,
            `Category: ${payload.category} — ${categoryDesc}`,
            `Tone: ${payload.tone}`,
            groundedNewsSummary ? `Grounded news context: ${groundedNewsSummary}` : "",
            payload.topicHint && !groundedNewsSummary ? `Topic hint from user: ${payload.topicHint}` : "",
            styleHint ? `Visual style preset direction: ${styleHint}` : "",
            "",
            "Each image prompt must:",
            "- Be 2-3 sentences long.",
            "- Describe the full visual scene: subject, composition, lighting, color palette, and atmosphere.",
            "- Be clearly connected to the category and topic above.",
            "- Feel premium, enterprise-grade, and LinkedIn-ready for Cendien.",
            "- Be different enough from the others (vary composition, focal element, or mood).",
            "",
            "Output format rules (strict):",
            `- Return exactly 4 prompt blocks.`,
            `- Start each block with '${promptLinePrefix}' on the first line.`,
            "- A prompt can continue on multiple lines after its first line.",
            `- Use the next '${promptLinePrefix}' marker to start the next prompt block.`,
            "- Do not include any text before the first marker or after the fourth prompt block.",
            "",
            "Example output format:",
            "PROMPT:: Cinematic command center with holographic data panels and strong directional lighting.",
            "Enterprise professionals collaborate in the background, Cendien branding subtly integrated.",
            "PROMPT:: Blueprint-style infographic with technical annotations and vintage sepia overlay.",
            "Isometric elements highlight the challenge-solution framework clearly.",
        ]
            .filter(Boolean)
            .join("\n");

        const startedAt = Date.now();
        console.log(
            `[run-prompt] gemini_call_start model=${env.GEMINI_TEXT_MODEL} category=${payload.category} tone=${payload.tone} grounded=${!!groundedNewsSummary}`
        );

        let response: any;
        try {
            response = await this.ai.models.generateContent({
                model: env.GEMINI_TEXT_MODEL,
                contents: promptLines,
                config: {
                    systemInstruction,
                    temperature: 1,
                    maxOutputTokens: 8192,
                },
            });
        } catch (error: any) {
            const elapsedMs = Date.now() - startedAt;
            console.error(
                `[run-prompt] gemini_call_error model=${env.GEMINI_TEXT_MODEL} elapsed_ms=${elapsedMs} error=${error?.message ?? String(error)}`
            );
            throw error;
        }

        const text = this.extractText(response);
        if (!text || !text.trim()) {
            throw new Error("Gemini returned no usable run prompts.");
        }

        const prompts = this.parsePrompts(text);
        if (prompts.length === 0) {
            throw new Error("Gemini returned no parseable run prompts.");
        }

        const totalElapsedMs = Date.now() - startedAt;
        console.log(
            `[run-prompt] gemini_call_done model=${env.GEMINI_TEXT_MODEL} elapsed_ms=${totalElapsedMs} returned_count=${prompts.length}`
        );

        return prompts.slice(0, 4);
    }

    private parsePrompts(text: string): string[] {
        const normalized = text.replace(/\r\n/g, "\n");
        const lines = normalized.split("\n");
        const blocks: string[] = [];
        let current: string[] | null = null;

        for (const rawLine of lines) {
            const trimmed = rawLine.trim();
            if (trimmed.toUpperCase().startsWith(promptLinePrefix)) {
                if (current && current.join("\n").trim()) {
                    blocks.push(current.join("\n").trim());
                }
                current = [trimmed.slice(promptLinePrefix.length).trim()];
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
            return Array.from(
                new Map(blocks.map((b) => [b.replace(/\s+/g, " ").trim().toLowerCase(), b])).values()
            );
        }

        // Fallback: plain non-empty lines
        return text
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
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
