export const TONES = [
  "professional",
  "urgent_hiring",
  "educational",
  "sales_focused",
  "funny",
  "engaging",
  "casual",
  "absurd"
] as const;

export type Tone = (typeof TONES)[number];

export const CATEGORIES = [
  "industry_news",
  "customer_pain_point",
  "company_update",
  "hiring",
  "product_education",
  "infor",
  "team"
] as const;

export type Category = (typeof CATEGORIES)[number];

export const RUN_STATUSES = [
  "queued",
  "researching",
  "drafting",
  "image_generation",
  "video_generation",
  "review_ready",
  "posted",
  "failed"
] as const;

export type RunStatus = (typeof RUN_STATUSES)[number];

export type SourceType = "daily" | "manual";

export const ASPECT_RATIOS = ["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"] as const;

export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const IMAGE_RESOLUTIONS = ["1K", "2K", "4K"] as const;

export type ImageResolution = (typeof IMAGE_RESOLUTIONS)[number];

export const VIDEO_DURATIONS = [4, 6, 8] as const;

export type VideoDuration = (typeof VIDEO_DURATIONS)[number];

export const VIDEO_ASPECT_RATIOS = ["9:16", "16:9"] as const;

export type VideoAspectRatio = (typeof VIDEO_ASPECT_RATIOS)[number];

export const VIDEO_RESOLUTIONS = ["720p", "1080p", "4k"] as const;

export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number];

export interface Citation {
  sourceUrl: string;
  snippet: string;
  confidence: number;
}

export interface ContentDraft {
  title: string;
  body: string;
  painPoints: string[];
  citations: Citation[];
  category: Category;
}

export type AssetType = "image" | "video";

export interface Asset {
  id: string;
  runId: string;
  type: AssetType;
  uri: string;
  modelId: string;
  generationMs: number;
  createdAt: string;
}

export type AgentStepName =
  | "news_hunter"
  | "content_creator"
  | "image_agent"
  | "video_agent"
  | "teams_delivery";

export type AgentStepStatus = "started" | "completed" | "failed";

export interface AgentStepLog {
  id: string;
  runId: string;
  stepName: AgentStepName;
  status: AgentStepStatus;
  message: string;
  startedAt: string;
  endedAt?: string;
  metadata?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface TeamsDelivery {
  runId: string;
  teamId: string;
  channelId: string;
  messageId?: string;
  postedAt?: string;
  status: "pending" | "posted" | "failed";
}

export interface RunInput {
  manualIdeaText?: string;
  uploadedFileRefs: string[];
  referenceAssetIds?: string[];
  requestedMedia: "image_only" | "image_video";
  selectedNewsTopic?: string;
  aspectRatio: AspectRatio;
  imageResolution: ImageResolution;
  videoDurationSeconds: VideoDuration;
  videoAspectRatio: VideoAspectRatio;
  videoResolution: VideoResolution;
  imageStyleInstruction?: string;
  stylePresetId?: string;
  fontPresetId?: string;
  colorSchemeId?: string;
}

export interface Run {
  id: string;
  sourceType: SourceType;
  status: RunStatus;
  tone: Tone;
  category: Category;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  input: RunInput;
  newsTopic?: string;
  newsSummary?: string;
  draft?: ContentDraft;
  assets: Asset[];
  teamsDelivery?: TeamsDelivery;
}

export interface ManualRunRequest {
  tone: Tone;
  category: Category;
  input: RunInput;
}

export interface DailyRunRequest {
  tone?: Tone;
  category?: Category;
  requestedMedia?: "image_only" | "image_video";
  aspectRatio?: AspectRatio;
  imageResolution?: ImageResolution;
  videoDurationSeconds?: VideoDuration;
  videoAspectRatio?: VideoAspectRatio;
  videoResolution?: VideoResolution;
  imageStyleInstruction?: string;
  stylePresetId?: string;
  fontPresetId?: string;
  colorSchemeId?: string;
  referenceAssetIds?: string[];
}

export interface RetryStepRequest {
  stepName: AgentStepName;
}

export interface PostToTeamsRequest {
  recipientEmails: string[];
}

export type LibraryAssetSource = "upload" | "graphic_generated";

export interface LibraryAsset {
  id: string;
  uri: string;
  title: string;
  mimeType: string;
  sizeBytes: number;
  source: LibraryAssetSource;
  createdAt: string;
  prompt?: string;
}

export interface GraphicGenerateRequest {
  prompt: string;
  aspectRatio: AspectRatio;
  imageResolution: ImageResolution;
  stylePresetId?: string;
  styleOverride?: string;
  fontPresetId?: string;
  colorSchemeId?: string;
  referenceAssetIds?: string[];
}

export interface GraphicGenerateResponse {
  asset: LibraryAsset;
}

export interface GraphicTopicGenerateRequest {
  topicHint?: string;
}

export interface GraphicTopicGenerateResponse {
  prompts: string[];
}

export interface AnalyticsSummary {
  totalRuns: number;
  successRate: number;
  averageRuntimeMs: number;
  runsByTone: Record<Tone, number>;
  runsByCategory: Record<Category, number>;
  stepFailureCounts: Record<AgentStepName, number>;
}

export interface EventMessage {
  type: "run_updated" | "log_added";
  payload: Run | AgentStepLog;
}
