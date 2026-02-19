import path from "node:path";
import { Storage } from "@google-cloud/storage";
import type { File } from "@google-cloud/storage";
import type { LibraryAsset } from "@marketing/shared";
import { env } from "../config/env.js";
import { createId } from "../utils/id.js";
import { nowIso } from "../utils/time.js";

interface InlineImagePart {
  mimeType: string;
  data: string;
}

export class LibraryService {
  private readonly storage = new Storage({
    projectId: env.VERTEX_GCLOUD_PROJECT
  });

  private readonly bucketName = env.MEDIA_GCS_BUCKET.trim();
  private readonly prefix = this.normalizePrefix(env.MEDIA_GCS_PREFIX);
  private readonly libraryPrefix = `${this.prefix}/library`;

  async listAssets(): Promise<LibraryAsset[]> {
    if (!this.bucketName) {
      return [];
    }

    const [files] = await this.storage.bucket(this.bucketName).getFiles({
      prefix: `${this.libraryPrefix}/`
    });

    const assets = await Promise.all(
      files
        .filter((file) => !file.name.endsWith("/"))
        .map((file) => this.fileToAsset(file))
    );

    return assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async uploadFromPart(part: {
    filename: string;
    mimetype: string;
    toBuffer: () => Promise<Buffer>;
  }): Promise<LibraryAsset> {
    const bytes = await part.toBuffer();
    const extension = this.extensionFromMimeType(part.mimetype) || path.extname(part.filename) || ".jpg";
    const id = createId();
    const objectPath = `${this.libraryPrefix}/${id}${extension}`;
    const file = this.storage.bucket(this.bucketName).file(objectPath);
    const safeTitle = this.cleanTitle(part.filename);
    const createdAt = nowIso();

    await file.save(bytes, {
      resumable: false,
      contentType: part.mimetype,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          id,
          title: safeTitle,
          source: "upload",
          createdAt
        }
      }
    });

    const uri = await this.getShareableUrl(file);
    return {
      id,
      uri,
      title: safeTitle,
      mimeType: part.mimetype,
      sizeBytes: bytes.byteLength,
      source: "upload",
      createdAt
    };
  }

  async saveGeneratedAsset(params: {
    uri: string;
    title: string;
    mimeTypeHint?: string;
  }): Promise<LibraryAsset> {
    const id = createId();
    const createdAt = nowIso();
    const source = "graphic_generated";

    const parsed = params.uri.startsWith("data:")
      ? this.parseDataUri(params.uri)
      : await this.fetchUri(params.uri, params.mimeTypeHint);
    const extension = this.extensionFromMimeType(parsed.mimeType) || ".png";
    const objectPath = `${this.libraryPrefix}/${id}${extension}`;
    const file = this.storage.bucket(this.bucketName).file(objectPath);
    const title = this.cleanTitle(params.title || "Generated graphic");

    await file.save(parsed.bytes, {
      resumable: false,
      contentType: parsed.mimeType,
      metadata: {
        cacheControl: "public, max-age=31536000",
        metadata: {
          id,
          title,
          source,
          createdAt
        }
      }
    });

    const uri = await this.getShareableUrl(file);
    return {
      id,
      uri,
      title,
      mimeType: parsed.mimeType,
      sizeBytes: parsed.bytes.byteLength,
      source,
      createdAt
    };
  }

  async getReferenceParts(referenceAssetIds: string[], limit: number): Promise<InlineImagePart[]> {
    if (!referenceAssetIds.length || limit <= 0 || !this.bucketName) {
      return [];
    }

    const ids = referenceAssetIds.slice(0, limit);
    const bucket = this.storage.bucket(this.bucketName);
    const parts: InlineImagePart[] = [];

    for (const id of ids) {
      const [files] = await bucket.getFiles({ prefix: `${this.libraryPrefix}/${id}` });
      const file = files.find((item) => !item.name.endsWith("/"));
      if (!file) {
        continue;
      }
      const [bytes] = await file.download();
      const mimeType = file.metadata?.contentType || this.mimeTypeFromExtension(path.extname(file.name));
      parts.push({
        mimeType,
        data: bytes.toString("base64")
      });
    }

    return parts;
  }

  async deleteAsset(assetId: string): Promise<boolean> {
    const id = assetId.trim();
    if (!id || !this.bucketName) {
      return false;
    }

    const bucket = this.storage.bucket(this.bucketName);
    const [files] = await bucket.getFiles({ prefix: `${this.libraryPrefix}/${id}` });
    const targets = files.filter((file) => !file.name.endsWith("/"));
    if (targets.length === 0) {
      return false;
    }

    await Promise.all(targets.map((file) => file.delete({ ignoreNotFound: true })));
    return true;
  }

  private async fileToAsset(file: File): Promise<LibraryAsset> {
    const [metadata] = await file.getMetadata();
    const meta = metadata?.metadata ?? {};
    const id = String(meta.id || path.basename(file.name).replace(path.extname(file.name), ""));
    const title = String(meta.title || path.basename(file.name));
    const source = meta.source === "graphic_generated" ? "graphic_generated" : "upload";
    const createdAt = String(meta.createdAt || metadata.timeCreated || nowIso());
    const uri = await this.getShareableUrl(file);

    return {
      id,
      uri,
      title,
      mimeType: metadata.contentType || this.mimeTypeFromExtension(path.extname(file.name)),
      sizeBytes: Number(metadata.size || 0),
      source,
      createdAt
    };
  }

  private async fetchUri(uri: string, mimeTypeHint?: string): Promise<{ mimeType: string; bytes: Buffer }> {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to download generated media (${response.status})`);
    }
    const mimeType = (response.headers.get("content-type") || mimeTypeHint || "image/png").split(";")[0]!.trim();
    return {
      mimeType,
      bytes: Buffer.from(await response.arrayBuffer())
    };
  }

  private parseDataUri(uri: string): { mimeType: string; bytes: Buffer } {
    const match = /^data:([^;,]+);base64,(.+)$/i.exec(uri);
    if (!match) {
      throw new Error("Invalid data URI");
    }
    return {
      mimeType: match[1] || "image/png",
      bytes: Buffer.from(match[2] || "", "base64")
    };
  }

  private async getShareableUrl(file: File): Promise<string> {
    if (env.MEDIA_GCS_PUBLIC) {
      try {
        await file.makePublic();
        return `https://storage.googleapis.com/${this.bucketName}/${encodeURIComponent(file.name).replace(/%2F/g, "/")}`;
      } catch {
        // fall back to signed URL
      }
    }
    const [signed] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + env.MEDIA_GCS_SIGNED_URL_TTL_HOURS * 60 * 60 * 1000
    });
    return signed;
  }

  private normalizePrefix(input: string): string {
    const trimmed = input.trim().replace(/^\/+|\/+$/g, "");
    return trimmed.length > 0 ? trimmed : "marketing-media";
  }

  private extensionFromMimeType(mimeType: string): string {
    const mime = mimeType.split(";")[0]!.trim().toLowerCase();
    if (mime === "image/png") return ".png";
    if (mime === "image/webp") return ".webp";
    if (mime === "image/gif") return ".gif";
    if (mime === "image/jpeg" || mime === "image/jpg") return ".jpg";
    return ".png";
  }

  private mimeTypeFromExtension(ext: string): string {
    switch (ext.toLowerCase()) {
      case ".png":
        return "image/png";
      case ".webp":
        return "image/webp";
      case ".gif":
        return "image/gif";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      default:
        return "image/png";
    }
  }

  private cleanTitle(name: string): string {
    const normalized = name.trim().replace(/\s+/g, " ");
    return normalized.length > 120 ? normalized.slice(0, 120) : normalized;
  }
}
