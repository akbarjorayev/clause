import { describe, expect, it } from "vitest";
import { groupFlagsByClause } from "@/lib/client/groupFlagsByClause";
import check from "@/lib/muse/fixtures/sa-check.json";
import type { Flag } from "@/lib/types";

const flags = check.flags as Flag[];

function flag(clause: string, severity: Flag["severity"]): Flag {
  return { rule_id: "x", severity, clause, title: "", explanation: "", source: "", action: "" };
}

describe("groupFlagsByClause", () => {
  it("puts flags about the same clause together", () => {
    const groups = groupFlagsByClause(flags);

    expect(groups).toHaveLength(5);
    const penalty = groups.find((g) => g.clause.includes("SAR 8,000"));
    expect(penalty?.flags).toHaveLength(2);
  });

  it("shows clauses with a serious problem first", () => {
    const groups = groupFlagsByClause([flag("A", "medium"), flag("B", "high"), flag("C", "medium")]);

    expect(groups.map((g) => g.clause)).toEqual(["B", "A", "C"]);
  });

  it("shows the serious flag first within a clause", () => {
    const [group] = groupFlagsByClause([flag("A", "medium"), flag("A", "high")]);

    expect(group.flags.map((f) => f.severity)).toEqual(["high", "medium"]);
  });
});
