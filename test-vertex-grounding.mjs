import dotenv from "dotenv";
import { tsImport } from "tsx/esm/api";

dotenv.config({ path: ".env" });

const question = process.argv.slice(2).join(" ").trim() || "Who is Javier Silva?";

try {
  const { ContentCreatorService } = await tsImport("./apps/api/src/services/content-creator-service.ts", {
    parentURL: import.meta.url
  });
  const { VertexContextService } = await tsImport("./apps/api/src/services/vertex-context-service.ts", {
    parentURL: import.meta.url
  });

  const contextService = new VertexContextService();
  const grounding = await contextService.retrieveContext(question, []);

  const contentService = new ContentCreatorService();
  const output = await contentService.generateDraft({
    tone: "educational",
    category: "customer_pain_point",
    newsTopic: question,
    newsSummary: `Question to answer from grounded data: ${question}`,
    manualIdeaText: question,
    groundingSnippet: grounding.contextSnippet,
    citations: grounding.citations
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        question,
        service: "ContentCreatorService.generateDraft",
        result: output.result,
        meta: output.meta
      },
      null,
      2
    )
  );
} catch (error) {
  const err = error;
  console.error(
    JSON.stringify(
      {
        ok: false,
        question,
        errorName: err instanceof Error ? err.name : "Error",
        errorMessage: err instanceof Error ? err.message : String(err)
      },
      null,
      2
    )
  );
  process.exit(1);
}
