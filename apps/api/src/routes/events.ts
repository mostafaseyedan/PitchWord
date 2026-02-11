import type { EventMessage } from "@marketing/shared";
import type { RouteRegistrar } from "./types.js";

export const registerEventsRoute: RouteRegistrar = (app, deps) => {
  app.get("/api/events", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");

    const sendEvent = (event: EventMessage): void => {
      reply.raw.write(`event: ${event.type}\n`);
      reply.raw.write(`data: ${JSON.stringify(event.payload)}\n\n`);
    };

    const listener = (event: EventMessage): void => sendEvent(event);
    deps.events.on("event", listener);

    request.raw.on("close", () => {
      deps.events.off("event", listener);
      reply.raw.end();
    });

    reply.hijack();
  });
};
