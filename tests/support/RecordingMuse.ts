import type { MessagePart, MuseClient } from "@/lib/muse/MuseClient";

// Test double: returns canned answers in order and records every request.
export class RecordingMuse implements MuseClient {
  readonly requests: MessagePart[][] = [];
  private next = 0;

  constructor(private readonly answers: unknown[]) {}

  async completeJson<T>(parts: MessagePart[]): Promise<T> {
    this.requests.push(parts);
    return this.answers[this.next++] as T;
  }
}
