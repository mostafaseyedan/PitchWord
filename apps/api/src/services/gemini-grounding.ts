import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";

export const isVertexGroundingEnabled = (): boolean => {
  return Boolean(env.VERTEX_GCLOUD_PROJECT && env.VERTEX_RAG_CORPUS_ID);
};

export const buildVertexDatastorePath = (): string | undefined => {
  if (!isVertexGroundingEnabled()) {
    return undefined;
  }

  return `projects/${env.VERTEX_GCLOUD_PROJECT}/locations/${env.VERTEX_SEARCH_LOCATION}/collections/default_collection/dataStores/${env.VERTEX_RAG_CORPUS_ID}`;
};

export const isUsingVertexClient = (): boolean => {
  return Boolean(env.VERTEX_GCLOUD_PROJECT);
};

export const buildGroundingTools = (opts?: { includeGoogleSearch?: boolean }): unknown[] | undefined => {
  if (!isUsingVertexClient()) {
    throw new Error(
      "Vertex grounding is required. Configure VERTEX_GCLOUD_PROJECT and remove GEMINI_API_KEY fallback usage for text workflows."
    );
  }

  const datastore = buildVertexDatastorePath();
  if (!datastore) {
    throw new Error("Vertex grounding is required. Configure VERTEX_RAG_CORPUS_ID to enable datastore retrieval.");
  }

  const tools: unknown[] = [
    {
      retrieval: {
        vertexAiSearch: {
          datastore
        },
        disableAttribution: false
      }
    }
  ];

  if (opts?.includeGoogleSearch) {
    tools.push({ googleSearch: {} });
  }

  return tools;
};

export const createGeminiClient = (): GoogleGenAI | undefined => {
  if (env.VERTEX_GCLOUD_PROJECT) {
    return new GoogleGenAI({
      vertexai: true,
      project: env.VERTEX_GCLOUD_PROJECT,
      location: env.VERTEX_AI_LOCATION
    } as any);
  }

  return undefined;
};
