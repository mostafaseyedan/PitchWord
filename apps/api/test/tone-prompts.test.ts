import { describe, expect, it } from "vitest";
import { tonePromptByTone } from "../src/agents/prompts/tone-prompts.js";

describe("tonePromptByTone", () => {
  it("contains all configured tones", () => {
    expect(Object.keys(tonePromptByTone).sort()).toEqual([
      "absurd",
      "casual",
      "educational",
      "engaging",
      "funny",
      "professional",
      "sales_focused",
      "urgent_hiring"
    ]);
  });
});
