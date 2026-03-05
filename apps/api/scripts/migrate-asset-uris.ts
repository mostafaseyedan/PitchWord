/**
 * Migration: base64 data URIs → disk files + thumbnails
 *
 * Reads all runs from Postgres (or exits cleanly if no DATABASE_URL),
 * finds image assets still stored as "data:" URIs, saves them to disk
 * as full-res + thumbnail, then updates the asset records in the DB.
 *
 * Run with:  npx tsx scripts/migrate-asset-uris.ts
 */

import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

dotenv.config({ path: "../../.env" });
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const APP_BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:8787";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, "../uploads/assets");
const THUMBS_DIR = path.resolve(__dirname, "../uploads/assets/thumbs");
const THUMB_WIDTH = 320;

async function ensureDirs() {
    await mkdir(ASSETS_DIR, { recursive: true });
    await mkdir(THUMBS_DIR, { recursive: true });
}

function parseDataUri(uri: string): { bytes: Buffer; mimeType: string; ext: string } | null {
    if (!uri.startsWith("data:")) return null;
    const commaIdx = uri.indexOf(",");
    if (commaIdx < 0) return null;
    const meta = uri.slice(5, commaIdx);
    if (!meta.includes(";base64")) return null;
    const mimeType = meta.split(";")[0]?.trim() ?? "image/jpeg";
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const bytes = Buffer.from(uri.slice(commaIdx + 1), "base64");
    return { bytes, mimeType, ext };
}

async function saveToDisk(
    assetId: string,
    bytes: Buffer,
    ext: string
): Promise<{ uri: string; thumbnailUri: string }> {
    const filename = `${assetId}.${ext}`;
    const thumbFilename = `${assetId}.jpg`;

    await writeFile(path.join(ASSETS_DIR, filename), bytes);

    try {
        const sharp = (await import("sharp")).default;
        await sharp(bytes)
            .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toFile(path.join(THUMBS_DIR, thumbFilename));
    } catch {
        // Fallback: copy full image as thumb
        await writeFile(path.join(THUMBS_DIR, thumbFilename), bytes);
    }

    const base = APP_BASE_URL.replace(/\/$/, "");
    return {
        uri: `${base}/assets/${filename}`,
        thumbnailUri: `${base}/assets/thumbs/${thumbFilename}`,
    };
}

async function main() {
    if (!DATABASE_URL) {
        console.log("⚠️  No DATABASE_URL set — using in-memory store which is ephemeral.");
        console.log("   Nothing to migrate. New images will be saved to disk automatically.");
        process.exit(0);
    }

    console.log("🔄  Connecting to Postgres...");
    // Inline minimal postgres client to avoid importing the full repository
    const { default: postgres } = await import("postgres");
    const sql = postgres(DATABASE_URL);

    try {
        await ensureDirs();
        console.log(`📁  Assets dir: ${ASSETS_DIR}`);
        console.log(`📁  Thumbs dir: ${THUMBS_DIR}\n`);

        // Fetch all runs with their assets
        const rows = await sql<{ id: string; assets: any[] }[]>`
      SELECT id, assets FROM runs WHERE assets != '[]'::jsonb
    `;

        console.log(`📋  Found ${rows.length} run(s) with assets.\n`);

        let totalAssets = 0;
        let migrated = 0;
        let skipped = 0;
        let failed = 0;

        for (const row of rows) {
            let runModified = false;
            const updatedAssets = await Promise.all(
                row.assets.map(async (asset: any) => {
                    totalAssets++;
                    if (asset.type !== "image") { skipped++; return asset; }
                    if (!asset.uri?.startsWith("data:")) {
                        console.log(`  ⏭  ${row.id}/${asset.id} — already an HTTP URL, skipping.`);
                        skipped++;
                        return asset;
                    }

                    const parsed = parseDataUri(asset.uri);
                    if (!parsed) {
                        console.warn(`  ⚠️  ${row.id}/${asset.id} — could not parse data URI, skipping.`);
                        skipped++;
                        return asset;
                    }

                    try {
                        const { uri, thumbnailUri } = await saveToDisk(asset.id, parsed.bytes, parsed.ext);
                        console.log(`  ✅  ${row.id}/${asset.id} → ${uri}`);
                        migrated++;
                        runModified = true;
                        return { ...asset, uri, thumbnailUri };
                    } catch (err) {
                        console.error(`  ❌  ${row.id}/${asset.id} — save failed:`, err);
                        failed++;
                        return asset;
                    }
                })
            );

            if (runModified) {
                await sql`
          UPDATE runs SET assets = ${sql.json(updatedAssets)} WHERE id = ${row.id}
        `;
            }
        }

        console.log(`\n✨  Migration complete.`);
        console.log(`   Total assets : ${totalAssets}`);
        console.log(`   Migrated     : ${migrated}`);
        console.log(`   Skipped      : ${skipped}`);
        console.log(`   Failed       : ${failed}`);
    } finally {
        await sql.end();
    }
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
