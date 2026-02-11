import { describe, expect, it } from "vitest";
import { InMemoryRunRepository } from "../src/repositories/in-memory-run-repository.js";

describe("InMemoryRunRepository", () => {
  it("creates and lists runs", async () => {
    const repo = new InMemoryRunRepository();

    const run = await repo.createRun({
      sourceType: "manual",
      tone: "professional",
      category: "industry_news",
      input: {
        uploadedFileRefs: [],
        requestedMedia: "image_only",
        aspectRatio: "16:9",
        imageResolution: "1K",
        manualIdeaText: "Idea"
      }
    });

    expect(run.status).toBe("queued");

    const runs = await repo.listRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0]?.id).toBe(run.id);
  });
});
