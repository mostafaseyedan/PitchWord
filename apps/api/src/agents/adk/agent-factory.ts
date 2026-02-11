import { env } from "../../config/env.js";
import { CENDIEN_CONTENT_GOAL, CENDIEN_CONTEXT } from "../prompts/brand-context.js";

export interface MarketingAgentGraph {
  supervisor: unknown;
  agents: {
    newsHunter: unknown;
    contentCreator: unknown;
    imageAgent: unknown;
    videoAgent: unknown;
  };
}

let cachedGraph: MarketingAgentGraph | undefined;

export const getOrCreateAdkGraph = async (): Promise<MarketingAgentGraph> => {
  if (cachedGraph) {
    return cachedGraph;
  }

  let adk: Record<string, any> = {};
  try {
    adk = (await import("@google/adk")) as Record<string, any>;
  } catch {
    adk = {};
  }
  const LlmAgentCtor = adk.LlmAgent ?? adk.Agent;
  const SequentialAgentCtor = adk.SequentialAgent;

  const createAgent = (config: Record<string, unknown>): unknown => {
    if (typeof LlmAgentCtor === "function") {
      return new LlmAgentCtor(config);
    }
    return { ...config, kind: "llm_agent_stub" };
  };

  const newsHunter = createAgent({
    name: "NewsHunterAgent",
    model: env.GEMINI_TEXT_MODEL,
    description: "Finds high-signal marketing news with source reliability checks.",
    instruction:
      `${CENDIEN_CONTEXT} ${CENDIEN_CONTENT_GOAL} Find recent marketing and enterprise technology developments that map to Cendien services and return source-backed summaries with pain-point relevance.`
  });

  const contentCreator = createAgent({
    name: "ContentCreatorAgent",
    model: env.GEMINI_TEXT_MODEL,
    description: "Generates grounded post copy from news + enterprise context.",
    instruction:
      `${CENDIEN_CONTEXT} ${CENDIEN_CONTENT_GOAL} Use grounded evidence and citations. Produce concise Cendien-branded LinkedIn-ready structure: hook, body, CTA.`
  });

  const imageAgent = createAgent({
    name: "ImageAgent",
    model: env.GEMINI_IMAGE_MODEL,
    description: "Generates high-fidelity marketing images aligned to draft content.",
    instruction:
      `${CENDIEN_CONTEXT} Generate a professional image concept and prompt aligned with Cendien brand-safe messaging. Delicately integrate the provided Cendien logo when reference media is available.`
  });

  const videoAgent = createAgent({
    name: "VideoAgent",
    model: env.VEO_MODEL,
    description: "Generates a short teaser clip based on approved content context.",
    instruction: "Generate a short video plan and prompt suitable for an enterprise social draft post."
  });

  const supervisor =
    typeof SequentialAgentCtor === "function"
      ? new SequentialAgentCtor({
          name: "SupervisorAgent",
          description: "Coordinates News -> Content -> Image -> Video sequencing.",
          subAgents: [newsHunter, contentCreator, imageAgent, videoAgent]
        })
      : {
          name: "SupervisorAgent",
          description: "ADK sequential supervisor unavailable; using orchestrator pipeline.",
          subAgents: [newsHunter, contentCreator, imageAgent, videoAgent]
        };

  cachedGraph = {
    supervisor,
    agents: { newsHunter, contentCreator, imageAgent, videoAgent }
  };

  return cachedGraph;
};
