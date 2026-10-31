import { describe, expect, it } from "vitest";
import { DocumentReader } from "@/lib/analysis/DocumentReader";
import reading from "@/lib/muse/fixtures/sa-reading.json";
import { RecordingMuse } from "./support/RecordingMuse";

const IMAGE = "data:image/jpeg;base64,AAAA";

describe("DocumentReader", () => {
  it("sends one prompt and the image, and returns Muse's reading", async () => {
    const muse = new RecordingMuse([reading]);

    const result = await new DocumentReader(muse).read(IMAGE);

    expect(result).toEqual(reading);
    const [parts] = muse.requests;
    expect(parts).toHaveLength(2);
    expect(parts[0].type).toBe("text");
    expect(parts[0].type === "text" && parts[0].text).toContain("English only");
    expect(parts[1]).toEqual({ type: "image_url", image_url: { url: IMAGE } });
  });
});
