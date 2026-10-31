import { describe, expect, it } from "vitest";
import { RulesRepository, isCountryCode } from "@/lib/rules/RulesRepository";
import type { CountryCode } from "@/lib/types";

const repository = new RulesRepository();
const COUNTRIES: CountryCode[] = ["SA", "AE", "RU", "MY"];

describe("RulesRepository", () => {
  it("loads the rules for a country", () => {
    expect(repository.forCountry("SA").rules).toHaveLength(11);
    expect(repository.forCountry("AE").rules).toHaveLength(12);
  });

  it("gives every rule the fields the checker relies on", () => {
    const all = [...COUNTRIES.map((c) => repository.forCountry(c)), repository.universal()];
    for (const file of all) {
      for (const rule of file.rules) {
        expect(rule.id, file.country).toBeTruthy();
        expect(rule.why, rule.id).toBeTruthy();
        expect(rule.source, rule.id).toBeTruthy();
        expect(rule.action, rule.id).toBeTruthy();
      }
    }
  });

  it("loads the universal ILO standards", () => {
    expect(repository.universal().country).toBe("ALL");
  });
});

describe("isCountryCode", () => {
  it("accepts supported countries only", () => {
    expect(isCountryCode("SA")).toBe(true);
    expect(isCountryCode("US")).toBe(false);
    expect(isCountryCode(undefined)).toBe(false);
    expect(isCountryCode("toString")).toBe(false);
  });
});
