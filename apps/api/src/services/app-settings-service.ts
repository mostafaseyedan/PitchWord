import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { nowIso } from "../utils/time.js";

interface TeamsDefaultsState {
  recipientEmails: string[];
  updatedAt: string;
}

interface AppSettingsState {
  teamsDefaults?: TeamsDefaultsState;
}

const settingsFilePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.runtime/app-settings.json"
);

export interface TeamsDefaults {
  recipientEmails: string[];
}

export class AppSettingsService {
  async getTeamsDefaults(): Promise<TeamsDefaults> {
    const state = await this.readState();
    if (state.teamsDefaults) {
      return {
        recipientEmails: state.teamsDefaults.recipientEmails
      };
    }

    return {
      recipientEmails: []
    };
  }

  async setTeamsDefaults(input: TeamsDefaults): Promise<TeamsDefaults> {
    const state = await this.readState();
    state.teamsDefaults = {
      recipientEmails: input.recipientEmails,
      updatedAt: nowIso()
    };
    await this.writeState(state);
    return input;
  }

  private async readState(): Promise<AppSettingsState> {
    try {
      const json = await readFile(settingsFilePath, "utf8");
      const parsed = JSON.parse(json) as AppSettingsState;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  private async writeState(state: AppSettingsState): Promise<void> {
    await mkdir(path.dirname(settingsFilePath), { recursive: true });
    await writeFile(settingsFilePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  }
}
