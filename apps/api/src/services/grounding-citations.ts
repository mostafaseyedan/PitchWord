import type { Citation } from "@marketing/shared";

interface GroundingChunkShape {
  web?: {
    uri?: string;
    url?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    documentName?: string;
    title?: string;
    text?: string;
  };
}

interface GroundingSupportShape {
  groundingChunkIndices?: number[];
  confidenceScores?: number[];
}

interface CandidateShape {
  citationMetadata?: {
    citations?: Array<{
      uri?: string;
      title?: string;
    }>;
  };
  groundingMetadata?: {
    groundingChunks?: GroundingChunkShape[];
    groundingSupports?: GroundingSupportShape[];
  };
}

interface ResponseShape {
  candidates?: CandidateShape[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const clampConfidence = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0.8;
  }
  return Math.max(0, Math.min(1, value));
};

const normalizeSnippet = (title?: string, text?: string): string => {
  const pieces = [title, text]
    .map((piece) => (piece ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (pieces.length > 0) {
    return pieces.join(" - ").slice(0, 500);
  }
  return "Grounded source document";
};

const getCandidateList = (response: unknown): CandidateShape[] => {
  if (!isRecord(response)) {
    return [];
  }
  const candidates = response.candidates;
  return Array.isArray(candidates) ? (candidates as CandidateShape[]) : [];
};

const buildConfidenceByChunkIndex = (supports: GroundingSupportShape[] | undefined): Map<number, number> => {
  const map = new Map<number, number>();
  if (!Array.isArray(supports)) {
    return map;
  }

  for (const support of supports) {
    const indices = Array.isArray(support.groundingChunkIndices) ? support.groundingChunkIndices : [];
    const scores = Array.isArray(support.confidenceScores) ? support.confidenceScores : [];

    for (let i = 0; i < indices.length; i += 1) {
      const index = indices[i];
      const score = scores[i];
      if (typeof index !== "number") {
        continue;
      }
      const confidence = clampConfidence(typeof score === "number" ? score : 0.8);
      const previous = map.get(index);
      if (previous === undefined || confidence > previous) {
        map.set(index, confidence);
      }
    }
  }

  return map;
};

export const extractGroundingCitations = (response: unknown): Citation[] => {
  const bySource = new Map<string, Citation>();

  const upsertCitation = (citation: Citation): void => {
    const existing = bySource.get(citation.sourceUrl);
    if (!existing || citation.confidence > existing.confidence || citation.snippet.length > existing.snippet.length) {
      bySource.set(citation.sourceUrl, {
        sourceUrl: citation.sourceUrl,
        snippet: citation.snippet,
        confidence: clampConfidence(citation.confidence)
      });
    }
  };

  for (const candidate of getCandidateList(response)) {
    const metadata = candidate.groundingMetadata;
    const chunks = Array.isArray(metadata?.groundingChunks) ? metadata.groundingChunks : [];
    const confidenceByChunk = buildConfidenceByChunkIndex(metadata?.groundingSupports);

    chunks.forEach((chunk, index) => {
      const webUri = toNonEmptyString(chunk.web?.uri) ?? toNonEmptyString(chunk.web?.url);
      const contextUri = toNonEmptyString(chunk.retrievedContext?.uri);
      const documentName = toNonEmptyString(chunk.retrievedContext?.documentName);
      const sourceUrl = webUri ?? contextUri ?? documentName;
      if (!sourceUrl) {
        return;
      }

      const title = toNonEmptyString(chunk.web?.title) ?? toNonEmptyString(chunk.retrievedContext?.title);
      const text = toNonEmptyString(chunk.retrievedContext?.text);
      const snippet = normalizeSnippet(title, text);
      const confidence = confidenceByChunk.get(index) ?? 0.8;

      upsertCitation({ sourceUrl, snippet, confidence });
    });

    const flatCitations = Array.isArray(candidate.citationMetadata?.citations) ? candidate.citationMetadata.citations : [];
    flatCitations.forEach((citation) => {
      const sourceUrl = toNonEmptyString(citation.uri);
      if (!sourceUrl) {
        return;
      }
      const snippet = normalizeSnippet(toNonEmptyString(citation.title));
      upsertCitation({ sourceUrl, snippet, confidence: 0.7 });
    });
  }

  return [...bySource.values()].sort((a, b) => b.confidence - a.confidence);
};
