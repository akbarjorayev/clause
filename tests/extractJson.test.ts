import { describe, expect, it } from "vitest";
import { extractJson } from "@/lib/muse/extractJson";
import { MuseResponseError } from "@/lib/muse/MuseClient";

describe("extractJson", () => {
  it("parses JSON wrapped in a code fence", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("parses JSON surrounded by prose", () => {
    expect(extractJson('Here you go: {"a":{"b":2}} thanks')).toEqual({ a: { b: 2 } });
  });

  it("rejects text without JSON", () => {
    expect(() => extractJson("no json")).toThrow(MuseResponseError);
  });

  it("rejects truncated JSON", () => {
    expect(() => extractJson('{"a":')).toThrow(MuseResponseError);
  });
});
