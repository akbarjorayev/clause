import { describe, expect, it } from "vitest";
import { maxDuration } from "@/app/api/analyze/route";
import { MUSE_TIMEOUT_MS } from "@/lib/muse/MuseClient";

const MUSE_CALLS_PER_ANALYSIS = 2;

describe("analyze route time budget", () => {
  it("lets both Muse calls time out before the platform kills the function", () => {
    expect(maxDuration * 1000).toBeGreaterThan(MUSE_CALLS_PER_ANALYSIS * MUSE_TIMEOUT_MS);
  });
});
