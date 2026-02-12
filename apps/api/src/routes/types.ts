import type { FastifyInstance } from "fastify";
import { AppEventBus } from "../events/event-bus.js";
import type { RunRepository } from "../repositories/run-repository.js";
import { AppSettingsService } from "../services/app-settings-service.js";
import { RunService } from "../services/run-service.js";
import { UploadService } from "../services/upload-service.js";

export interface RouteDependencies {
  runService: RunService;
  runRepository: RunRepository;
  settingsService: AppSettingsService;
  uploadService: UploadService;
  events: AppEventBus;
}

export type RouteRegistrar = (app: FastifyInstance, deps: RouteDependencies) => void;
