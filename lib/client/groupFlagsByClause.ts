import type { Flag } from "@/lib/types";

export interface ClauseGroup {
  clause: string;
  flags: Flag[];
}

// One clause can break several rules; show those flags together, serious clauses first.
export function groupFlagsByClause(flags: Flag[]): ClauseGroup[] {
  const groups = new Map<string, Flag[]>();
  for (const flag of flags) groups.set(flag.clause, [...(groups.get(flag.clause) ?? []), flag]);

  const seriousFirst = (list: Flag[]) => [
    ...list.filter((f) => f.severity === "high"),
    ...list.filter((f) => f.severity !== "high"),
  ];
  const isSerious = (group: ClauseGroup) => group.flags.some((f) => f.severity === "high");
  const ordered = [...groups].map(([clause, grouped]) => ({ clause, flags: seriousFirst(grouped) }));
  return [...ordered.filter(isSerious), ...ordered.filter((g) => !isSerious(g))];
}
