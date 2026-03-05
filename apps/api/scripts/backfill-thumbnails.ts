/**
 * Backfill: generate thumbnails for image assets that have an HTTP(S) URI
 * but no thumbnailUri set in the DB.
 *
 * Run with:  npx tsx scripts/backfill-thumbnails.ts
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
const THUMBS_DIR = path.resolve(__dirname, "../uploads/assets/thumbs");
const THUMB_WIDTH = 320;

async function main() {
    if (!DATABASE_URL) {
        console.log("No DATABASE_URL — nothing to backfill.");
        process.exit(0);
    }

    const { default: postgres } = await import("postgres");
    const sql = postgres(DATABASE_URL);

    try {
        await mkdir(THUMBS_DIR, { recursive: true });

        const rows = await sql<{ id: string; assets: any[] }[]>`
            SELECT id, assets FROM runs
            WHERE assets IS NOT NULL AND jsonb_array_length(assets) > 0
        `;

        console.log(`Found ${rows.length} run(s). Scanning for missing thumbnails...\n`);

        let updated = 0;
        let skipped = 0;
        let failed = 0;

        for (const row of rows) {
            let runModified = false;

            const updatedAssets = await Promise.all(
                row.assets.map(async (asset: any) => {
                    if (asset.type !== "image") return asset;
                    if (asset.thumbnailUri) { skipped++; return asset; }
                    if (!asset.uri?.startsWith("http")) { skipped++; return asset; }

                    try {
                        const response = await fetch(asset.uri);
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        const contentType = response.headers.get("content-type") ?? "image/jpeg";
                        const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
                        const imageBytes = Buffer.from(await response.arrayBuffer());

                        const thumbFilename = `${asset.id}.jpg`;
                        const thumbPath = path.join(THUMBS_DIR, thumbFilename);

                        const sharp = (await import("sharp")).default;
                        await sharp(imageBytes)
                            .resize(THUMB_WIDTH, undefined, { withoutEnlargement: true })
                            .jpeg({ quality: 75 })
                            .toFile(thumbPath);

                        const thumbnailUri = `${APP_BASE_URL.replace(/\/$/, "")}/assets/thumbs/${thumbFilename}`;
                        console.log(`  ✓ ${row.id.slice(0, 8)} / ${asset.id.slice(0, 8)}.${ext}  →  thumb: ${thumbFilename}`);
                        updated++;
                        runModified = true;
                        return { ...asset, thumbnailUri };
                    } catch (err: any) {
                        console.error(`  ✗ ${row.id.slice(0, 8)} / ${asset.id.slice(0, 8)} — ${err.message}`);
                        failed++;
                        return asset;
                    }
                })
            );

            if (runModified) {
                await sql`UPDATE runs SET assets = ${sql.json(updatedAssets)} WHERE id = ${row.id}`;
            }
        }

        console.log(`\nDone.  updated=${updated}  skipped=${skipped}  failed=${failed}`);
    } finally {
        await sql.end();
    }
}

main().catch((err) => {
    console.error("Backfill failed:", err);
    process.exit(1);
});
