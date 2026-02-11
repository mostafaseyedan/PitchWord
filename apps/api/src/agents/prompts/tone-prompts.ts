import type { Tone } from "@marketing/shared";

export const tonePromptByTone: Record<Tone, string> = {
  professional:
    "Write in a confident, executive-ready voice. Avoid slang and keep claims precise and sourced.",
  urgent_hiring:
    "Write with urgency and momentum, emphasizing time-sensitive hiring or staffing gaps without sounding alarmist.",
  educational:
    "Write for clarity and learning. Use concise explanation, practical framing, and concrete takeaways.",
  sales_focused:
    "Write with commercial intent and outcome orientation, focusing on business value and next-step CTA.",
  funny:
    "Write with light humor and wit while staying professional, clear, and relevant to enterprise decision-makers.",
  engaging:
    "Write with strong narrative momentum, vivid hooks, and audience-centered phrasing that encourages interaction.",
  casual:
    "Write in a relaxed, conversational tone with simple language while preserving credibility and concrete value.",
  absurd:
    "Use playful, unexpected, and surreal framing to grab attention, but keep the core business message coherent and useful."
};

export const categoryGuidance = {
  industry_news: "Prioritize trend relevance and immediate market implications.",
  customer_pain_point: "Frame around recurring customer friction and risk mitigation.",
  company_update: "Connect external events to your current capabilities and execution.",
  hiring: "Highlight team growth needs and urgency with clear role/value framing.",
  product_education: "Explain concepts and best practices with a practical how-to angle.",
  infor: "Prioritize Infor ecosystem relevance, ERP modernization context, and operational transformation outcomes.",
  team: "Highlight people, culture, expertise, and trusted delivery capability with authentic team-centered storytelling."
} as const;
