import { describe, expect, it } from "vitest";
import { tonePromptByTone } from "../src/agents/prompts/tone-prompts.js";
describe("tonePromptByTone", () => {
    it("contains all configured tones", () => {
        expect(Object.keys(tonePromptByTone).sort()).toEqual([
            "educational",
            "professional",
            "sales_focused",
            "urgent_hiring"
        ]);
    });
});
//# sourceMappingURL=tone-prompts.test.js.map