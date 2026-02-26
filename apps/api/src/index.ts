import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import { env } from "./config/env.js";
import { AppEventBus } from "./events/event-bus.js";
import { PostgresRunRepository } from "./db/postgres-run-repository.js";
import { InMemoryRunRepository } from "./repositories/in-memory-run-repository.js";
import type { RunRepository } from "./repositories/run-repository.js";
import { registerEventsRoute } from "./routes/events.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerLibraryRoutes } from "./routes/library.js";
import { registerLogsAndAnalyticsRoutes } from "./routes/logs-and-analytics.js";
import { registerRunRoutes } from "./routes/runs.js";
import { registerSettingsRoutes } from "./routes/settings.js";
import { registerUploadRoutes } from "./routes/uploads.js";
import { AppSettingsService } from "./services/app-settings-service.js";
import { ContentCreatorService } from "./services/content-creator-service.js";
import { GraphicGenerationService } from "./services/graphic-generation-service.js";
import { GraphicTopicService } from "./services/graphic-topic-service.js";
import { RunPromptService } from "./services/run-prompt-service.js";
import { ImageAgentService } from "./services/image-agent-service.js";
import { InMemoryJobQueue } from "./services/job-queue.js";
import { NewsHunterService } from "./services/news-hunter-service.js";
import { RunOrchestrator } from "./services/run-orchestrator.js";
import { RunService } from "./services/run-service.js";
import { TeamsDeliveryService } from "./services/teams-delivery-service.js";
import { UploadService } from "./services/upload-service.js";
import { VertexContextService } from "./services/vertex-context-service.js";
import { VideoAgentService } from "./services/video-agent-service.js";
import { MediaStorageService } from "./services/media-storage-service.js";
import { LibraryService } from "./services/library-service.js";

const createRepository = async (): Promise<RunRepository> => {
  if (!env.DATABASE_URL) {
    return new InMemoryRunRepository();
  }

  const repository = new PostgresRunRepository(env.DATABASE_URL);
  await repository.migrate();
  return repository;
};

const start = async (): Promise<void> => {
  const app = Fastify({ logger: { level: "warn" } });

  await app.register(cors, {
    origin: [env.WEB_BASE_URL, "http://localhost:5173", env.APP_BASE_URL],
    credentials: true
  });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicPath = path.join(__dirname, "../../web/dist");

  await app.register(fastifyStatic, {
    root: publicPath,
    wildcard: false
  });

  await app.register(multipart, {
    limits: {
      fileSize: 25 * 1024 * 1024,
      files: 4
    }
  });

  const events = new AppEventBus();
  const runRepository = await createRepository();

  const recovered = await runRepository.recoverStaleRuns();
  if (recovered > 0) {
    console.log(`Recovered ${recovered} stale run(s) on startup.`);
  }

  const newsHunterService = new NewsHunterService();
  const vertexContextService = new VertexContextService();
  const contentCreatorService = new ContentCreatorService();
  const libraryService = new LibraryService();
  const imageAgentService = new ImageAgentService(libraryService);
  const videoAgentService = new VideoAgentService();
  const mediaStorageService = new MediaStorageService();
  const graphicGenerationService = new GraphicGenerationService(libraryService);
  const graphicTopicService = new GraphicTopicService();
  const runPromptService = new RunPromptService(newsHunterService, contentCreatorService);
  const teamsDeliveryService = new TeamsDeliveryService();
  const uploadService = new UploadService();
  const settingsService = new AppSettingsService();

  const orchestrator = new RunOrchestrator(
    runRepository,
    events,
    newsHunterService,
    vertexContextService,
    contentCreatorService,
    imageAgentService,
    videoAgentService,
    mediaStorageService,
    teamsDeliveryService
  );

  const queue = new InMemoryJobQueue(async ({ runId }) => {
    try {
      await orchestrator.executeRun(runId);
    } catch (error: any) {
      app.log.error(
        {
          runId,
          errorName: error?.name,
          errorMessage: error?.message,
          errorStatus: error?.status,
          errorStack: error?.stack
        },
        "run execution failed"
      );
    }
  });

  const runService = new RunService(runRepository, queue, orchestrator, mediaStorageService, events);

  const routeDeps = {
    runService,
    runRepository,
    settingsService,
    uploadService,
    libraryService,
    graphicGenerationService,
    graphicTopicService,
    runPromptService,
    events
  };

  registerHealthRoute(app, routeDeps);
  registerRunRoutes(app, routeDeps);
  registerSettingsRoutes(app, routeDeps);
  registerUploadRoutes(app, routeDeps);
  registerLibraryRoutes(app, routeDeps);
  registerLogsAndAnalyticsRoutes(app, routeDeps);
  registerEventsRoute(app, routeDeps);

  // Serve index.html for any route not caught by API routes (SPA support)
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/api")) {
      reply.code(404).send({
        message: `Route ${request.method}:${request.url} not found`,
        error: "Not Found",
        statusCode: 404
      });
      return;
    }
    return reply.sendFile("index.html");
  });

  app.addHook("onClose", async () => {
    if (runRepository instanceof PostgresRunRepository) {
      await runRepository.close();
    }
  });

  await app.listen({
    host: "0.0.0.0",
    port: env.PORT
  });

  app.log.info(`API listening on ${env.APP_BASE_URL}`);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
