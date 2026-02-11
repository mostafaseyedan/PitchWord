import type { Citation } from "@marketing/shared";
import { CENDIEN_CONTENT_GOAL, CENDIEN_CONTEXT } from "../agents/prompts/brand-context.js";
import { buildVertexDatastorePath, isUsingVertexClient, isVertexGroundingEnabled } from "./gemini-grounding.js";

export interface GroundingContext {
  contextSnippet: string;
  citations: Citation[];
}

export class VertexContextService {
  async retrieveContext(query: string, uploadedFileRefs: string[]): Promise<GroundingContext> {
    const datastore = buildVertexDatastorePath();
    const fileMentions = uploadedFileRefs.length
      ? `User attached files for this run: ${uploadedFileRefs.join(", ")}.`
      : "No uploaded files attached for this run.";

    if (!isVertexGroundingEnabled() || !datastore) {
      throw new Error(
        "Vertex grounding is required. Configure VERTEX_GCLOUD_PROJECT and VERTEX_RAG_CORPUS_ID before running."
      );
    }

    if (!isUsingVertexClient()) {
      throw new Error(
        "Vertex grounding is required and GEMINI_API_KEY fallback is disabled for text workflows. Use Vertex client credentials."
      );
    }

    // Grounding is executed inside Gemini calls via tools.retrieval.vertexAiSearch.
    // This pre-step only annotates run metadata for traceability in logs/UI.
    return {
      contextSnippet: `Grounding query: ${query}. ${fileMentions} ${CENDIEN_CONTEXT} ${CENDIEN_CONTENT_GOAL} Vertex grounding enabled via datastore ${datastore}.`,
      citations: []
    };
  }
}
