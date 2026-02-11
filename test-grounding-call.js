import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: '.env' });

const project = process.env.VERTEX_GCLOUD_PROJECT;
const aiLocation = process.env.VERTEX_AI_LOCATION || 'global';
const searchLocation = process.env.VERTEX_SEARCH_LOCATION || 'global';
const datastoreId = process.env.VERTEX_RAG_CORPUS_ID;
const model = process.env.GEMINI_TEXT_MODEL;

if (!project || !datastoreId || !model) {
  console.error(JSON.stringify({
    ok: false,
    error: 'Missing required env for Vertex test',
    required: ['VERTEX_GCLOUD_PROJECT', 'VERTEX_RAG_CORPUS_ID', 'GEMINI_TEXT_MODEL']
  }, null, 2));
  process.exit(1);
}

const datastore = `projects/${project}/locations/${searchLocation}/collections/default_collection/dataStores/${datastoreId}`;

const ai = new GoogleGenAI({
  vertexai: true,
  project,
  location: aiLocation
});

const response = await ai.models.generateContent({
  model,
  contents: [
    {
      role: 'user',
      parts: [
        {
          text: [
            'Use retrieval grounding and write 2 short bullets about Cendien ITSM and Microsoft partnership.',
            'Keep it factual and concise.'
          ].join(' ')
        }
      ]
    }
  ],
  config: {
    tools: [
      {
        retrieval: {
          vertexAiSearch: {
            datastore
          },
          disableAttribution: false
        }
      }
    ],
    temperature: 1,
    maxOutputTokens: 512
  }
});

const candidate = response?.candidates?.[0] ?? {};
const groundingMetadata = candidate?.groundingMetadata ?? {};
const citationMetadata = candidate?.citationMetadata ?? {};

const groundingChunks = Array.isArray(groundingMetadata.groundingChunks)
  ? groundingMetadata.groundingChunks
  : [];
const groundingSupports = Array.isArray(groundingMetadata.groundingSupports)
  ? groundingMetadata.groundingSupports
  : [];
const citations = Array.isArray(citationMetadata.citations)
  ? citationMetadata.citations
  : [];

console.log(JSON.stringify({
  ok: true,
  model,
  vertex: {
    project,
    aiLocation,
    searchLocation,
    datastore
  },
  textPreview: typeof response?.text === 'string' ? response.text.slice(0, 400) : null,
  candidateKeys: Object.keys(candidate),
  groundingMetadataKeys: Object.keys(groundingMetadata),
  counts: {
    groundingChunks: groundingChunks.length,
    groundingSupports: groundingSupports.length,
    citationMetadataCitations: citations.length
  },
  firstGroundingChunk: groundingChunks[0] ?? null,
  firstGroundingSupport: groundingSupports[0] ?? null,
  firstCitation: citations[0] ?? null
}, null, 2));
