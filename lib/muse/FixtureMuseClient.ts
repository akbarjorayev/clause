import type { MuseClient } from "./MuseClient";

// Replays saved Muse answers in order, so the app can be built and tested without paid calls.
// An optional wait per answer stands in for how long a real Muse call takes.
export class FixtureMuseClient implements MuseClient {
  private next = 0;

  constructor(
    private readonly answers: unknown[],
    private readonly delayMs = 0,
  ) {}

  async completeJson<T>(): Promise<T> {
    if (this.next >= this.answers.length) throw new Error("FixtureMuseClient has no answers left");
    if (this.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    return this.answers[this.next++] as T;
  }
}
