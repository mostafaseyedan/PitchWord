import type { FastifyInstance } from "fastify";
import { AppEventBus } from "../events/event-bus.js";
import type { RunRepository } from "../repositories/run-repository.js";
import { RunService } from "../services/run-service.js";
import { UploadService } from "../services/upload-service.js";

export interface RouteDependencies {
  runService: RunService;
  runRepository: RunRepository;
  uploadService: UploadService;
  events: AppEventBus;
}

export type RouteRegistrar = (app: FastifyInstance, deps: RouteDependencies) => void;
