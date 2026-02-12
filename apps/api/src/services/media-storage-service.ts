import path from "node:path";
import { Storage } from "@google-cloud/storage";
import type { File } from "@google-cloud/storage";
import type { Asset } from "@marketing/shared";
import { env } from "../config/env.js";

type ShareMode = "public" | "signed" | "none";

export interface PersistedAssetOutput {
  result: Asset;
  meta: {
    uploadedToGcs: boolean;
    sourceScheme: "data" | "gs" | "http" | "https" | "unknown";
    bucket?: string;
    objectPath?: string;
    shareableUrl?: string;
    shareMode: ShareMode;
    error?: string;
  };
}

interface GsLocation {
  bucket: string;
  objectPath: string;
}

export class MediaStorageService {
  private readonly storage = new Storage({
    projectId: env.VERTEX_GCLOUD_PROJECT
  });

  private readonly bucketName = env.MEDIA_GCS_BUCKET.trim();
  private readonly prefix = this.normalizePrefix(env.MEDIA_GCS_PREFIX);

  async persistAsset(asset: Asset): Promise<PersistedAssetOutput> {
    const sourceScheme = this.detectUriScheme(asset.uri);
    if (!this.bucketName) {
      return {
        result: asset,
        meta: {
          uploadedToGcs: false,
          sourceScheme,
          shareMode: "none",
          error: "MEDIA_GCS_BUCKET is empty"
        }
      };
    }

    try {
      if (sourceScheme === "data") {
        return this.persistDataUriAsset(asset);
      }
      if (sourceScheme === "gs") {
        return this.persistGsUriAsset(asset);
      }
      if (sourceScheme === "http" || sourceScheme === "https") {
        return this.persistHttpUriAsset(asset);
      }

      return {
        result: asset,
        meta: {
          uploadedToGcs: false,
          sourceScheme,
          shareMode: "none",
          error: "Unsupported URI scheme"
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Media upload skipped for asset ${asset.id}: ${message}`);
      return {
        result: asset,
        meta: {
          uploadedToGcs: false,
          sourceScheme,
          shareMode: "none",
          error: message
        }
      };
    }
  }

  private async persistDataUriAsset(asset: Asset): Promise<PersistedAssetOutput> {
    const parsed = this.parseDataUri(asset.uri, asset.type);
    const extension = this.extensionFromMimeType(parsed.mimeType, asset.type);
    const objectPath = this.buildObjectPath(asset, extension);
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectPath);

    await file.save(parsed.bytes, {
      resumable: false,
      contentType: parsed.mimeType,
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    });

    const share = await this.getShareableUrl(file);
    return {
      result: {
        ...asset,
        uri: share.url
      },
      meta: {
        uploadedToGcs: true,
        sourceScheme: "data",
        bucket: this.bucketName,
        objectPath,
        shareableUrl: share.url,
        shareMode: share.mode
      }
    };
  }

  private async persistGsUriAsset(asset: Asset): Promise<PersistedAssetOutput> {
    const source = this.parseGsUri(asset.uri);
    const extension = this.extensionFromObjectPath(source.objectPath, asset.type);
    const objectPath = this.buildObjectPath(asset, extension);

    const destinationBucket = this.storage.bucket(this.bucketName);
    const destination = destinationBucket.file(objectPath);

    if (!(source.bucket === this.bucketName && source.objectPath === objectPath)) {
      const sourceFile = this.storage.bucket(source.bucket).file(source.objectPath);
      await sourceFile.copy(destination);
    }

    const share = await this.getShareableUrl(destination);
    return {
      result: {
        ...asset,
        uri: share.url
      },
      meta: {
        uploadedToGcs: true,
        sourceScheme: "gs",
        bucket: this.bucketName,
        objectPath,
        shareableUrl: share.url,
        shareMode: share.mode
      }
    };
  }

  private async persistHttpUriAsset(asset: Asset): Promise<PersistedAssetOutput> {
    const response = await this.fetchRemoteMedia(asset.uri);
    if (!response.ok) {
      return {
        result: asset,
        meta: {
          uploadedToGcs: false,
          sourceScheme: this.detectUriScheme(asset.uri),
          shareMode: "none",
          error: `Failed to fetch remote media (${response.status})`
        }
      };
    }

    const responseBytes = await response.arrayBuffer();
    const contentType = this.normalizeMimeType(
      response.headers.get("content-type") ?? this.defaultMimeType(asset.type),
      asset.type
    );

    const extension = this.extensionFromMimeType(contentType, asset.type);
    const objectPath = this.buildObjectPath(asset, extension);

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(objectPath);
    await file.save(Buffer.from(responseBytes), {
      resumable: false,
      contentType,
      metadata: {
        cacheControl: "public, max-age=31536000"
      }
    });

    const share = await this.getShareableUrl(file);
    return {
      result: {
        ...asset,
        uri: share.url
      },
      meta: {
        uploadedToGcs: true,
        sourceScheme: this.detectUriScheme(asset.uri),
        bucket: this.bucketName,
        objectPath,
        shareableUrl: share.url,
        shareMode: share.mode
      }
    };
  }

  private async fetchRemoteMedia(uri: string): Promise<Response> {
    const initial = await fetch(uri);
    if (initial.ok) {
      return initial;
    }

    const canRetryWithGeminiAuth =
      Boolean(env.GEMINI_API_KEY) &&
      (initial.status === 401 || initial.status === 403) &&
      this.isGoogleHostedMediaUrl(uri);

    if (!canRetryWithGeminiAuth) {
      return initial;
    }

    const withHeader = await fetch(uri, {
      headers: {
        "x-goog-api-key": env.GEMINI_API_KEY!
      }
    });
    if (withHeader.ok) {
      return withHeader;
    }

    const uriWithKey = this.appendApiKeyQuery(uri, env.GEMINI_API_KEY!);
    if (!uriWithKey || uriWithKey === uri) {
      return withHeader;
    }

    return fetch(uriWithKey);
  }

  private isGoogleHostedMediaUrl(uri: string): boolean {
    try {
      const host = new URL(uri).hostname.toLowerCase();
      return (
        host === "googleapis.com" ||
        host.endsWith(".googleapis.com") ||
        host === "googleusercontent.com" ||
        host.endsWith(".googleusercontent.com") ||
        host === "gvt1.com" ||
        host.endsWith(".gvt1.com")
      );
    } catch {
      return false;
    }
  }

  private appendApiKeyQuery(uri: string, apiKey: string): string | undefined {
    try {
      const parsed = new URL(uri);
      if (!parsed.hostname.toLowerCase().endsWith(".googleapis.com") && parsed.hostname.toLowerCase() !== "googleapis.com") {
        return undefined;
      }
      if (!parsed.searchParams.has("key")) {
        parsed.searchParams.set("key", apiKey);
      }
      return parsed.toString();
    } catch {
      return undefined;
    }
  }

  private async getShareableUrl(file: File): Promise<{ url: string; mode: ShareMode }> {
    if (env.MEDIA_GCS_PUBLIC) {
      try {
        await file.makePublic();
        return {
          url: this.publicUrl(this.bucketName, file.name),
          mode: "public"
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Could not make GCS object public (${file.name}): ${message}`);
      }
    }

    const expiresMs = Date.now() + env.MEDIA_GCS_SIGNED_URL_TTL_HOURS * 60 * 60 * 1000;
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expiresMs
    });

    return { url: signedUrl, mode: "signed" };
  }

  private parseDataUri(uri: string, assetType: Asset["type"]): { mimeType: string; bytes: Buffer } {
    const commaIndex = uri.indexOf(",");
    if (!uri.startsWith("data:") || commaIndex <= 5) {
      throw new Error("Invalid data URI");
    }

    const metadata = uri.slice(5, commaIndex);
    if (!/;base64(?:;|$)/i.test(metadata)) {
      throw new Error("Only base64 data URIs are supported");
    }

    const mimeToken = metadata.split(";")[0];
    const mimeType = this.normalizeMimeType(mimeToken || this.defaultMimeType(assetType), assetType);
    const encoded = uri.slice(commaIndex + 1);
    return {
      mimeType,
      bytes: Buffer.from(encoded, "base64")
    };
  }

  private parseGsUri(uri: string): GsLocation {
    if (!uri.startsWith("gs://")) {
      throw new Error("Invalid gs:// URI");
    }
    const withoutScheme = uri.slice("gs://".length);
    const firstSlash = withoutScheme.indexOf("/");
    if (firstSlash <= 0 || firstSlash === withoutScheme.length - 1) {
      throw new Error("Invalid gs:// URI format");
    }
    return {
      bucket: withoutScheme.slice(0, firstSlash),
      objectPath: withoutScheme.slice(firstSlash + 1)
    };
  }

  private buildObjectPath(asset: Asset, extension: string): string {
    const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || this.defaultExtension(asset.type);
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
    return `${this.prefix}/${asset.type}/${asset.runId}/${asset.id}-${stamp}.${safeExtension}`;
  }

  private defaultMimeType(assetType: Asset["type"]): string {
    return assetType === "video" ? "video/mp4" : "image/png";
  }

  private defaultExtension(assetType: Asset["type"]): string {
    return assetType === "video" ? "mp4" : "png";
  }

  private normalizeMimeType(raw: string, assetType: Asset["type"]): string {
    const normalized = raw.split(";")[0]?.trim().toLowerCase();
    if (!normalized) {
      return this.defaultMimeType(assetType);
    }
    return normalized;
  }

  private extensionFromObjectPath(objectPath: string, assetType: Asset["type"]): string {
    const fromPath = path.extname(objectPath).replace(/^\./, "").toLowerCase();
    if (fromPath) {
      return fromPath;
    }
    return this.defaultExtension(assetType);
  }

  private extensionFromMimeType(mimeType: string, assetType: Asset["type"]): string {
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov"
    };
    return map[mimeType] ?? this.defaultExtension(assetType);
  }

  private detectUriScheme(uri: string): "data" | "gs" | "http" | "https" | "unknown" {
    if (uri.startsWith("data:")) return "data";
    if (uri.startsWith("gs://")) return "gs";
    if (uri.startsWith("http://")) return "http";
    if (uri.startsWith("https://")) return "https";
    return "unknown";
  }

  private normalizePrefix(prefix: string): string {
    const trimmed = prefix.trim().replace(/^\/+|\/+$/g, "");
    return trimmed || "marketing-media";
  }

  private publicUrl(bucket: string, objectPath: string): string {
    return `https://storage.googleapis.com/${bucket}/${objectPath}`;
  }
}
