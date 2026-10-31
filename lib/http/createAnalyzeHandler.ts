import type { ContractAnalyzer } from "@/lib/analysis/ContractAnalyzer";
import { parseAnalyzeRequest } from "./parseAnalyzeRequest";
import type { RateLimiter } from "./RateLimiter";

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

// The analyzer is created per request: the fixture Muse client replays answers in order.
// Never log the request: it carries the worker's photo.
export function createAnalyzeHandler(getAnalyzer: () => ContractAnalyzer, limiter: RateLimiter) {
  return async function POST(request: Request): Promise<Response> {
    if (!limiter.allow(clientIp(request))) {
      return Response.json({ error: "Too many requests, try again later" }, { status: 429 });
    }

    const parsed = await parseAnalyzeRequest(await request.formData());
    if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

    try {
      return Response.json(await getAnalyzer().analyze(parsed.imageDataUrl, parsed.country));
    } catch (error) {
      console.error("Analysis failed:", error instanceof Error ? error.name : "unknown error");
      return Response.json({ error: "Analysis failed, please try again" }, { status: 502 });
    }
  };
}
