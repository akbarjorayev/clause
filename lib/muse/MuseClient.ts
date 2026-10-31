import { extractJson } from "./extractJson";
import { MuseResponseError } from "./MuseResponseError";

export { MuseResponseError };

const API_URL = "https://api.meta.ai/v1/chat/completions";
const MODEL = "muse-spark-1.3";
export const MUSE_TIMEOUT_MS = 55_000;

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface MuseClient {
  completeJson<T>(parts: MessagePart[]): Promise<T>;
}

export class HttpMuseClient implements MuseClient {
  constructor(
    private readonly apiKey: string,
    private readonly fetchFn: typeof fetch = fetch,
    private readonly timeoutMs: number = MUSE_TIMEOUT_MS,
  ) {}

  async completeJson<T>(parts: MessagePart[]): Promise<T> {
    const response = await this.fetchFn(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: parts }] }),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    // The error body is deliberately not included: it can echo request details.
    if (!response.ok) throw new MuseResponseError(`Muse request failed with status ${response.status}`);
    const body = await response.json();
    return extractJson<T>(body.choices[0].message.content);
  }
}
