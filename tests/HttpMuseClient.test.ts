import { describe, expect, it } from "vitest";
import { HttpMuseClient, MuseResponseError, type MessagePart } from "@/lib/muse/MuseClient";

const API_KEY = "test-secret-key";
const PARTS: MessagePart[] = [
  { type: "text", text: "read this" },
  { type: "image_url", image_url: { url: "data:image/jpeg;base64,AAAA" } },
];

function fakeFetch(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status });
  }) as unknown as typeof fetch;
  return { fn, calls };
}

describe("HttpMuseClient", () => {
  it("sends the parts to Muse and returns the parsed JSON answer", async () => {
    const fetch = fakeFetch(200, { choices: [{ message: { content: '{"ok":true}' } }] });
    const client = new HttpMuseClient(API_KEY, fetch.fn);

    const answer = await client.completeJson<{ ok: boolean }>(PARTS);

    expect(answer).toEqual({ ok: true });
    const { url, init } = fetch.calls[0];
    expect(url).toBe("https://api.meta.ai/v1/chat/completions");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${API_KEY}`);
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("muse-spark-1.3");
    expect(sent.messages).toEqual([{ role: "user", content: PARTS }]);
  });

  it("fails with the status but never leaks the API key", async () => {
    const fetch = fakeFetch(401, { error: `bad key ${API_KEY}` });
    const client = new HttpMuseClient(API_KEY, fetch.fn);

    const error = (await client.completeJson(PARTS).catch((e: unknown) => e)) as Error;

    expect(error).toBeInstanceOf(MuseResponseError);
    expect(error.message).toContain("401");
    expect(error.message).not.toContain(API_KEY);
  });
});
