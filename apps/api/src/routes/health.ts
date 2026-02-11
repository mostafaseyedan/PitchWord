import type { RouteRegistrar } from "./types.js";

export const registerHealthRoute: RouteRegistrar = (app) => {
  app.get("/health", async () => {
    return { ok: true, service: "marketing-agent-platform-api" };
  });
};
