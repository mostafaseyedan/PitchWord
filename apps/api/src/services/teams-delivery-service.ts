import type { ContentDraft, Run, TeamsDelivery } from "@marketing/shared";
import { env } from "../config/env.js";
import { nowIso } from "../utils/time.js";

interface PostRequest {
  run: Run;
  teamId: string;
  channelId: string;
}

export interface TeamsPostOutput {
  result: TeamsDelivery;
  meta: {
    graphApiStatus: number;
    messageId: string | undefined;
    teamId: string;
    channelId: string;
  };
}

export class TeamsDeliveryService {
  async postDraft({ run, teamId, channelId }: PostRequest): Promise<TeamsPostOutput> {
    const draft = run.draft;
    if (!draft) {
      throw new Error("Cannot post to Teams without generated draft content.");
    }

    if (!env.MS_CLIENT_ID || !env.MS_CLIENT_SECRET || !env.MS_TENANT_ID) {
      throw new Error("Teams delivery requires MS_TENANT_ID, MS_CLIENT_ID, and MS_CLIENT_SECRET.");
    }

    const accessToken = await this.getGraphToken();
    const body = this.buildMessageBody(draft, run.assets);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Teams post failed (${response.status}): ${text}`);
    }

    const apiResult = (await response.json()) as { id?: string };

    return {
      result: {
        runId: run.id,
        teamId,
        channelId,
        status: "posted",
        messageId: apiResult.id,
        postedAt: nowIso()
      },
      meta: {
        graphApiStatus: response.status,
        messageId: apiResult.id,
        teamId,
        channelId
      }
    };
  }

  private async getGraphToken(): Promise<string> {
    const tokenEndpoint = `https://login.microsoftonline.com/${env.MS_TENANT_ID}/oauth2/v2.0/token`;

    const form = new URLSearchParams({
      client_id: env.MS_CLIENT_ID ?? "",
      client_secret: env.MS_CLIENT_SECRET ?? "",
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default"
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form.toString()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Graph token request failed (${response.status}): ${text}`);
    }

    const payload = (await response.json()) as { access_token?: string };
    if (!payload.access_token) {
      throw new Error("Graph token missing access_token");
    }

    return payload.access_token;
  }

  private buildMessageBody(draft: ContentDraft, assets: Run["assets"]): Record<string, unknown> {
    const image = assets.find((asset) => asset.type === "image");
    const video = assets.find((asset) => asset.type === "video");

    const lines = [
      `<h3>${this.escapeHtml(draft.title)}</h3>`,
      `<p><strong>${this.escapeHtml(draft.hook)}</strong></p>`,
      `<p>${this.escapeHtml(draft.body).replace(/\n/g, "<br/>")}</p>`,
      `<p><em>${this.escapeHtml(draft.cta)}</em></p>`
    ];

    if (image) {
      lines.push(`<p>Image: <a href="${image.uri}">Open generated image</a></p>`);
    }

    if (video) {
      lines.push(`<p>Video: <a href="${video.uri}">Watch generated video</a></p>`);
    }

    return {
      body: {
        contentType: "html",
        content: lines.join("\n")
      }
    };
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
