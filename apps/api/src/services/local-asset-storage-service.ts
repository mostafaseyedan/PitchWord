import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Asset } from "@marketing/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store images in apps/api/uploads/assets/ so they survive dev restarts
const ASSETS_DIR = path.resolve(__dirname, "../../uploads/assets");
const THUMBS_DIR = path.resolve(__dirname, "../../uploads/assets/thumbs");

// Thumbnail max width in pixels — small enough for gallery cards
const THUMB_WIDTH = 320;

export interface LocalStorageResult {
    uri: string;
    thumbnailUri: string;
}

export class LocalAssetStorageService {
    private initialized = false;

    private async ensureDirs(): Promise<void> {
        if (this.initialized) return;
        await mkdir(ASSETS_DIR, { recursive: true });
        await mkdir(THUMBS_DIR, { recursive: true });
        this.initialized = true;
    }

    /**
     * Saves an image to disk, generates a thumbnail, and returns local URL paths.
     * Accepts data URIs and http/https URLs. Returns null for video assets.
     */
    async saveImage(asset: Asset, baseUrl: string): Promise<LocalStorageResult | null> {
        if (asset.type !== "image") return null;

        let imageBytes: Buffer;
        let ext: string;

        if (asset.uri.startsWith("data:")) {
            const commaIdx = asset.uri.indexOf(",");
            if (commaIdx < 0) return null;
            const meta = asset.uri.slice(5, commaIdx); // e.g. "image/jpeg;base64"
            const mimeType = meta.split(";")[0]?.trim() ?? "image/jpeg";
            ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
            imageBytes = Buffer.from(asset.uri.slice(commaIdx + 1), "base64");
        } else if (asset.uri.startsWith("http://") || asset.uri.startsWith("https://")) {
            try {
                const response = await fetch(asset.uri);
                if (!response.ok) return null;
                const contentType = response.headers.get("content-type") ?? "image/jpeg";
                ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
                imageBytes = Buffer.from(await response.arrayBuffer());
            } catch {
                return null;
            }
        } else {
            return null;
        }

        await this.ensureDirs();

        const filename = `${asset.id}.${ext}`;
        const thumbFilename = `${asset.id}.jpg`;
        const fullPath = path.join(ASSETS_DIR, filename);
        const thumbPath = path.join(THUMBS_DIR, thumbFilename);

        await writeFile(fullPath, imageBytes);

        try {
            const sharp = (await import("sharp")).default;
            await sharp(imageBytes)
                .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
                .jpeg({ quality: 75 })
                .toFile(thumbPath);
        } catch (err) {
            console.warn(`Thumbnail generation failed for ${asset.id}, falling back to full image:`, err);
            await writeFile(thumbPath, imageBytes);
        }

        const base = baseUrl.replace(/\/$/, "");
        return {
            uri: `${base}/assets/${filename}`,
            thumbnailUri: `${base}/assets/thumbs/${thumbFilename}`,
        };
    }
}
