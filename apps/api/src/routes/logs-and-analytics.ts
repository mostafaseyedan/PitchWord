import type { RouteRegistrar } from "./types.js";

export const registerLogsAndAnalyticsRoutes: RouteRegistrar = (app, deps) => {
  app.get("/api/logs", async (request) => {
    const query = request.query as { runId?: string };
    return deps.runRepository.listLogs(query.runId);
  });

  app.get("/api/analytics/summary", async () => {
    return deps.runRepository.getAnalyticsSummary();
  });
};
