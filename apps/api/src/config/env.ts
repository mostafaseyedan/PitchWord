import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../../.env" });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(8787),
  APP_BASE_URL: z.string().url().default("http://localhost:8787"),
  WEB_BASE_URL: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().optional(),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_IMAGE_MODEL: z.string().default("gemini-3-pro-image-preview"),
  GEMINI_TEXT_MODEL: z.string().default("gemini-3-flash-preview"),
  VEO_MODEL: z.string().default("veo-3.1-fast"),
  CENDIEN_LOGO_PATH: z.string().optional(),

  VERTEX_GCLOUD_PROJECT: z.string().optional(),
  VERTEX_AI_LOCATION: z.string().default("us-central1"),
  VERTEX_SEARCH_LOCATION: z.string().default("global"),
  VERTEX_RAG_CORPUS_ID: z.string().optional(),

  MS_TENANT_ID: z.string().optional(),
  MS_CLIENT_ID: z.string().optional(),
  MS_CLIENT_SECRET: z.string().optional(),
  TEAMS_DRAFT_TEAM_ID: z.string().optional(),
  TEAMS_DRAFT_CHANNEL_ID: z.string().optional(),

  DEFAULT_TONE: z.string().default("professional"),
  DEFAULT_CATEGORY: z.string().default("industry_news"),
  AUTO_POST_TO_DRAFT_CHANNEL: z
    .string()
    .default("true")
    .transform((value) => value.toLowerCase() === "true"),

  ADK_APP_NAME: z.string().default("marketing-agent-platform")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(formatted, null, 2)}`);
}

export const env = parsed.data;
