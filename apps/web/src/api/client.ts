import type {
  AgentStepLog,
  AnalyticsSummary,
  DailyRunRequest,
  GraphicGenerateRequest,
  GraphicGenerateResponse,
  GraphicTopicGenerateRequest,
  GraphicTopicGenerateResponse,
  LibraryAsset,
  ManualRunRequest,
  Run,
  RetryStepRequest,
  PostToTeamsRequest,
  RunPromptGenerateRequest,
  RunPromptGenerateResponse
} from "@marketing/shared";


const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
export interface TeamsDefaults {
  recipientEmails: string[];
}

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
};

export const apiClient = {
  async createDailyRun(payload?: DailyRunRequest): Promise<Run> {
    const response = await fetch(`${API_BASE}/api/runs/daily`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload ?? { requestedMedia: "image_only" })
    });
    return parseJson<Run>(response);
  },

  async createManualRun(payload: ManualRunRequest): Promise<Run> {
    const response = await fetch(`${API_BASE}/api/runs/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<Run>(response);
  },

  async listRuns(): Promise<Run[]> {
    const response = await fetch(`${API_BASE}/api/runs`);
    return parseJson<Run[]>(response);
  },

  async getRun(runId: string): Promise<Run> {
    const response = await fetch(`${API_BASE}/api/runs/${runId}`);
    return parseJson<Run>(response);
  },

  async deleteRun(runId: string): Promise<{ deleted: boolean }> {
    const response = await fetch(`${API_BASE}/api/runs/${runId}`, {
      method: "DELETE"
    });
    return parseJson<{ deleted: boolean }>(response);
  },

  async listLogs(runId?: string): Promise<AgentStepLog[]> {
    const url = runId ? `${API_BASE}/api/logs?runId=${encodeURIComponent(runId)}` : `${API_BASE}/api/logs`;
    const response = await fetch(url);
    return parseJson<AgentStepLog[]>(response);
  },

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const response = await fetch(`${API_BASE}/api/analytics/summary`);
    return parseJson<AnalyticsSummary>(response);
  },

  async retryStep(runId: string, payload: RetryStepRequest): Promise<Run> {
    const response = await fetch(`${API_BASE}/api/runs/${runId}/retry-step`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<Run>(response);
  },

  async postToTeams(runId: string, payload: PostToTeamsRequest): Promise<Run> {
    const response = await fetch(`${API_BASE}/api/runs/${runId}/post-to-teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<Run>(response);
  },

  async getTeamsDefaults(): Promise<TeamsDefaults> {
    const response = await fetch(`${API_BASE}/api/settings/teams-defaults`);
    return parseJson<TeamsDefaults>(response);
  },

  async setTeamsDefaults(payload: TeamsDefaults): Promise<TeamsDefaults> {
    const response = await fetch(`${API_BASE}/api/settings/teams-defaults`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<TeamsDefaults>(response);
  },

  async uploadFile(file: File): Promise<{ fileRef: string; originalFilename: string; sizeBytes: number }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/uploads`, {
      method: "POST",
      body: formData
    });

    return parseJson<{ fileRef: string; originalFilename: string; sizeBytes: number }>(response);
  },

  async listLibraryAssets(): Promise<LibraryAsset[]> {
    const response = await fetch(`${API_BASE}/api/library/assets`);
    return parseJson<LibraryAsset[]>(response);
  },

  async uploadLibraryAsset(file: File): Promise<LibraryAsset> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/library/assets/upload`, {
      method: "POST",
      body: formData
    });

    return parseJson<LibraryAsset>(response);
  },

  async deleteLibraryAsset(assetId: string): Promise<{ deleted: boolean }> {
    const response = await fetch(`${API_BASE}/api/library/assets/${encodeURIComponent(assetId)}`, {
      method: "DELETE"
    });
    return parseJson<{ deleted: boolean }>(response);
  },

  async generateGraphicAsset(payload: GraphicGenerateRequest): Promise<GraphicGenerateResponse> {
    const response = await fetch(`${API_BASE}/api/library/graphics/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<GraphicGenerateResponse>(response);
  },

  async generateGraphicTopic(payload: GraphicTopicGenerateRequest): Promise<GraphicTopicGenerateResponse> {
    const response = await fetch(`${API_BASE}/api/library/graphics/topic`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<GraphicTopicGenerateResponse>(response);
  },

  async generateRunPrompts(payload: RunPromptGenerateRequest): Promise<RunPromptGenerateResponse> {
    const response = await fetch(`${API_BASE}/api/runs/generate-prompts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return parseJson<RunPromptGenerateResponse>(response);
  },

  createEventSource(): EventSource {
    return new EventSource(`${API_BASE}/api/events`);
  }
};

