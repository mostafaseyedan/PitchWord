import type { ContentDraft, Run, TeamsDelivery } from "@marketing/shared";
import { env } from "../config/env.js";
import { nowIso } from "../utils/time.js";

interface PostRequest {
  run: Run;
  teamId?: string;
  channelId?: string;
}

export interface TeamsPostOutput {
  result: TeamsDelivery;
  meta: {
    graphApiStatus: number;
    messageId: string | undefined;
    teamId: string;
    channelId: string;
    deliveryMethod: "graph" | "webhook";
  };
}

export class TeamsDeliveryService {
  async postDraft({ run, teamId, channelId }: PostRequest): Promise<TeamsPostOutput> {
    const draft = run.draft;
    if (!draft) {
      throw new Error("Cannot post to Teams without generated draft content.");
    }

    const resolvedTeamId = (teamId ?? "").trim();
    const resolvedChannelId = (channelId ?? "").trim();

    if (env.TEAMS_WEBHOOK_URL) {
      return this.postViaWebhook({
        run,
        teamId: resolvedTeamId || "webhook",
        channelId: resolvedChannelId || "webhook"
      });
    }

    if (!resolvedTeamId || !resolvedChannelId) {
      throw new Error("Team ID and Channel ID are required unless TEAMS_WEBHOOK_URL is configured.");
    }

    if (!env.MS_CLIENT_ID || !env.MS_CLIENT_SECRET || !env.MS_TENANT_ID) {
      throw new Error(
        "Teams delivery via Graph requires MS_TENANT_ID, MS_CLIENT_ID, and MS_CLIENT_SECRET, or configure TEAMS_WEBHOOK_URL."
      );
    }

    const accessToken = await this.getGraphToken();
    const body = this.buildMessageBody(draft, run.assets);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${resolvedTeamId}/channels/${resolvedChannelId}/messages`,
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
        teamId: resolvedTeamId,
        channelId: resolvedChannelId,
        status: "posted",
        messageId: apiResult.id,
        postedAt: nowIso()
      },
      meta: {
        graphApiStatus: response.status,
        messageId: apiResult.id,
        teamId: resolvedTeamId,
        channelId: resolvedChannelId,
        deliveryMethod: "graph"
      }
    };
  }

  private async postViaWebhook({
    run,
    teamId,
    channelId
  }: {
    run: Run;
    teamId: string;
    channelId: string;
  }): Promise<TeamsPostOutput> {
    const draft = run.draft!;
    const adaptiveCard = this.buildAdaptiveCard(draft, run.assets);
    const payload = {
      text: this.buildWebhookText(draft, run.assets),
      adaptiveCard,
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          contentUrl: null,
          content: adaptiveCard
        }
      ]
    };

    const response = await fetch(env.TEAMS_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Teams webhook post failed (${response.status}): ${text}`);
    }

    return {
      result: {
        runId: run.id,
        teamId,
        channelId,
        status: "posted",
        messageId: undefined,
        postedAt: nowIso()
      },
      meta: {
        graphApiStatus: response.status,
        messageId: undefined,
        teamId,
        channelId,
        deliveryMethod: "webhook"
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
    const imageUrl = image ? this.getShareableUrl(image.uri) : undefined;
    const videoUrl = video ? this.getShareableUrl(video.uri) : undefined;

    const lines = [
      `<h3>${this.escapeHtml(draft.title)}</h3>`,
      `<p><strong>${this.escapeHtml(draft.hook)}</strong></p>`,
      `<p>${this.escapeHtml(draft.body).replace(/\n/g, "<br/>")}</p>`,
      `<p><em>${this.escapeHtml(draft.cta)}</em></p>`
    ];

    if (imageUrl) {
      lines.push(`<p>Image: <a href="${imageUrl}">Open generated image</a></p>`);
    }

    if (videoUrl) {
      lines.push(`<p>Video: <a href="${videoUrl}">Watch generated video</a></p>`);
    }

    return {
      body: {
        contentType: "html",
        content: lines.join("\n")
      }
    };
  }

  private buildWebhookText(draft: ContentDraft, assets: Run["assets"]): string {
    const image = assets.find((asset) => asset.type === "image");
    const video = assets.find((asset) => asset.type === "video");
    const imageUrl = image ? this.getShareableUrl(image.uri) : undefined;
    const videoUrl = video ? this.getShareableUrl(video.uri) : undefined;

    const lines = [draft.title, "", draft.hook, "", draft.body, "", `CTA: ${draft.cta}`];

    if (imageUrl) {
      lines.push("", `Image: ${imageUrl}`);
    }

    if (videoUrl) {
      lines.push("", `Video: ${videoUrl}`);
    }

    return lines.join("\n");
  }

  private buildAdaptiveCard(draft: ContentDraft, assets: Run["assets"]): Record<string, unknown> {
    const image = assets.find((asset) => asset.type === "image");
    const video = assets.find((asset) => asset.type === "video");
    const imageUrl = image ? this.getShareableUrl(image.uri) : undefined;
    const videoUrl = video ? this.getShareableUrl(video.uri) : undefined;

    const body: Array<Record<string, unknown>> = [
      {
        type: "TextBlock",
        text: draft.title,
        size: "Large",
        weight: "Bolder",
        wrap: true
      },
      {
        type: "TextBlock",
        text: draft.hook,
        wrap: true,
        spacing: "Medium"
      },
      ...(imageUrl
        ? [
            {
              type: "Image",
              url: imageUrl,
              size: "Stretch",
              altText: "Generated campaign image"
            } as Record<string, unknown>
          ]
        : []),
      {
        type: "TextBlock",
        text: draft.body,
        wrap: true,
        spacing: "Medium"
      },
      {
        type: "TextBlock",
        text: `CTA: ${draft.cta}`,
        wrap: true,
        spacing: "Medium",
        weight: "Bolder"
      }
    ];

    if (draft.painPoints.length > 0) {
      body.push({
        type: "TextBlock",
        text: `Pain Points: ${draft.painPoints.join(" | ")}`,
        wrap: true,
        spacing: "Medium"
      });
    }

    const actions: Array<Record<string, unknown>> = [];
    if (imageUrl) {
      actions.push({
        type: "Action.OpenUrl",
        title: "Open Image",
        url: imageUrl
      });
    }
    if (videoUrl) {
      actions.push({
        type: "Action.OpenUrl",
        title: "Open Video",
        url: videoUrl
      });
    }

    return {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      type: "AdaptiveCard",
      version: "1.4",
      body,
      ...(actions.length > 0 ? { actions } : {})
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

  private getShareableUrl(uri: string): string | undefined {
    if (/^https?:\/\//i.test(uri)) {
      return uri;
    }
    return undefined;
  }
}
