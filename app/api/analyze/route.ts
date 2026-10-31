import { createAnalyzer } from "@/lib/analysis/createAnalyzer";
import { createAnalyzeHandler } from "@/lib/http/createAnalyzeHandler";
import { RateLimiter } from "@/lib/http/RateLimiter";

const CHECKS_PER_HOUR = 10;
const HOUR_MS = 60 * 60_000;

// Two Muse calls usually take ~30 s, but each may run until its 55 s timeout;
// the function must outlive both so a slow call ends in our JSON error, not a platform kill.
export const maxDuration = 120;

// The limit protects paid Muse credits; saved fixture answers cost nothing, so don't limit them.
const isFixtureMode = process.env.MUSE_MODE === "fixture";

export const POST = createAnalyzeHandler(
  () => createAnalyzer({ MUSE_MODE: process.env.MUSE_MODE, MUSE_API_KEY: process.env.MUSE_API_KEY }),
  new RateLimiter(isFixtureMode ? Number.POSITIVE_INFINITY : CHECKS_PER_HOUR, HOUR_MS),
);
