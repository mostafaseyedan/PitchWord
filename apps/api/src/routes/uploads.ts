import type { RouteRegistrar } from "./types.js";

export const registerUploadRoutes: RouteRegistrar = (app, deps) => {
  app.post("/api/uploads", async (request, reply) => {
    const part = await (request as any).file();
    if (!part) {
      return reply.status(400).send({ error: "Missing file in multipart body" });
    }

    const saved = await deps.uploadService.saveFile(part);
    return reply.status(201).send(saved);
  });
};
