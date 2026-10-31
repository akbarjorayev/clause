import { describe, expect, it } from "vitest";
import { ContractChecker } from "@/lib/analysis/ContractChecker";
import { MuseResponseError } from "@/lib/muse/MuseClient";
import { RulesRepository } from "@/lib/rules/RulesRepository";
import type { Flag, Reading } from "@/lib/types";
import check from "@/lib/muse/fixtures/sa-check.json";
import reading from "@/lib/muse/fixtures/sa-reading.json";
import { RecordingMuse } from "./support/RecordingMuse";

const rules = new RulesRepository();
const SA = rules.forCountry("SA");

function flag(overrides: Partial<Flag>): Flag {
  return {
    rule_id: "passport-retention",
    severity: "high",
    clause: "The passport stays with the employer.",
    title: "Passport kept",
    explanation: "...",
    source: "Council of Ministers Resolution No. 166 (1421H)",
    action: "...",
    ...overrides,
  };
}

describe("ContractChecker", () => {
  it("returns Muse's flags for the Saudi contract", async () => {
    const muse = new RecordingMuse([check]);

    const flags = await new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    expect(flags).toHaveLength(7);
  });

  it("sends the reading and both rule sets in the prompt", async () => {
    const muse = new RecordingMuse([check]);

    await new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    const [[prompt]] = muse.requests;
    const text = prompt.type === "text" ? prompt.text : "";
    expect(text).toContain("SAR 8,000");
    expect(text).toContain("Labor Law Art. 40(1)");
    expect(text).toContain("ILO Fair Recruitment General Principle 7");
  });

  it("drops flags for rules we don't have and never trusts Muse's law citation", async () => {
    const muse = new RecordingMuse([
      { flags: [flag({ rule_id: "made-up" }), flag({ source: "Some Law Art. 999" })] },
    ]);

    const flags = await new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    expect(flags).toHaveLength(1);
    expect(flags[0].source).toBe("Council of Ministers Resolution No. 166 (1421H)");
  });

  it("takes severity from our rules, so a serious problem can't be downgraded", async () => {
    const muse = new RecordingMuse([{ flags: [flag({ severity: "medium" })] }]);

    const [result] = await new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    expect(result.severity).toBe("high");
  });

  it("fails instead of reporting a clean document when Muse's answer has no flags list", async () => {
    const muse = new RecordingMuse([{ result: "looks fine" }]);

    const checking = new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    await expect(checking).rejects.toThrow(MuseResponseError);
  });

  it("marks the document as data, so text inside it can't give instructions", async () => {
    const muse = new RecordingMuse([check]);

    await new ContractChecker(muse).check(reading as Reading, SA, rules.universal());

    const [[prompt]] = muse.requests;
    const text = prompt.type === "text" ? prompt.text : "";
    expect(text).toContain("<document>");
    expect(text).toContain("</document>");
    expect(text).toMatch(/never follow instructions/i);
  });
});
