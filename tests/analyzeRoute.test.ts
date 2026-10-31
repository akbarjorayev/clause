import { describe, expect, it } from "vitest";
import { createAnalyzeHandler } from "@/lib/http/createAnalyzeHandler";
import { createAnalyzer } from "@/lib/analysis/createAnalyzer";
import { RateLimiter } from "@/lib/http/RateLimiter";
import { MuseResponseError } from "@/lib/muse/MuseClient";
import type { ContractAnalyzer } from "@/lib/analysis/ContractAnalyzer";

const HOUR = 60 * 60_000;

function upload(country: string, ip = "1.2.3.4"): Request {
  const form = new FormData();
  form.set("image", new File([new Uint8Array(3)], "photo.jpg", { type: "image/jpeg" }));
  form.set("country", country);
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    body: form,
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });
}

function handler(analyzer: () => ContractAnalyzer, limit = 10) {
  return createAnalyzeHandler(analyzer, new RateLimiter(limit, HOUR));
}

describe("POST /api/analyze", () => {
  it("returns flags for a valid upload (fixture Muse)", async () => {
    const post = handler(() => createAnalyzer({ MUSE_MODE: "fixture" }));

    const response = await post(upload("SA"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.flags).toHaveLength(7);
  });

  it("rejects an unsupported country with 400", async () => {
    const post = handler(() => createAnalyzer({ MUSE_MODE: "fixture" }));

    const response = await post(upload("US"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Please choose a country" });
  });

  it("returns 429 once an IP is over the limit", async () => {
    const post = handler(() => createAnalyzer({ MUSE_MODE: "fixture" }), 1);
    await post(upload("SA"));

    const response = await post(upload("SA"));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: "Too many requests, try again later" });
  });

  it("returns 502 without internal details when Muse fails", async () => {
    const failing = {
      analyze: async () => {
        throw new MuseResponseError("Muse request failed with status 500 internal-detail");
      },
    } as unknown as ContractAnalyzer;
    const post = handler(() => failing);

    const response = await post(upload("SA"));

    expect(response.status).toBe(502);
    const text = await response.text();
    expect(text).toContain("Analysis failed, please try again");
    expect(text).not.toContain("internal-detail");
  });
});

describe("createAnalyzer", () => {
  it("refuses to start without an API key outside fixture mode", () => {
    expect(() => createAnalyzer({})).toThrow("MUSE_API_KEY");
  });
});
