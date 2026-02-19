import type { FastifyInstance } from "fastify";
import { AppEventBus } from "../events/event-bus.js";
import type { RunRepository } from "../repositories/run-repository.js";
import { AppSettingsService } from "../services/app-settings-service.js";
import { GraphicGenerationService } from "../services/graphic-generation-service.js";
import { GraphicTopicService } from "../services/graphic-topic-service.js";
import { LibraryService } from "../services/library-service.js";
import { RunService } from "../services/run-service.js";
import { UploadService } from "../services/upload-service.js";

export interface RouteDependencies {
  runService: RunService;
  runRepository: RunRepository;
  settingsService: AppSettingsService;
  uploadService: UploadService;
  libraryService: LibraryService;
  graphicGenerationService: GraphicGenerationService;
  graphicTopicService: GraphicTopicService;
  events: AppEventBus;
}

export type RouteRegistrar = (app: FastifyInstance, deps: RouteDependencies) => void;
