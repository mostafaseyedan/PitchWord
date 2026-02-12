import { z } from "zod";
import type { RouteRegistrar } from "./types.js";

const teamsDefaultsSchema = z.object({
  recipientEmails: z.array(z.string().email())
});

export const registerSettingsRoutes: RouteRegistrar = (app, deps) => {
  app.get("/api/settings/teams-defaults", async () => {
    return deps.settingsService.getTeamsDefaults();
  });

  app.put("/api/settings/teams-defaults", async (request, reply) => {
    const parsed = teamsDefaultsSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.flatten() });
    }

    return deps.settingsService.setTeamsDefaults(parsed.data);
  });
};
