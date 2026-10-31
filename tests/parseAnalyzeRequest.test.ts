import { describe, expect, it } from "vitest";
import { parseAnalyzeRequest } from "@/lib/http/parseAnalyzeRequest";

const MB = 1024 * 1024;

function form(image: File | null, country: string | null): FormData {
  const data = new FormData();
  if (image) data.set("image", image);
  if (country !== null) data.set("country", country);
  return data;
}

function photo(type: string, bytes = 3): File {
  return new File([new Uint8Array(bytes)], "photo", { type });
}

describe("parseAnalyzeRequest", () => {
  it("turns a valid upload into a data URL and a country", async () => {
    const result = await parseAnalyzeRequest(form(photo("image/jpeg"), "SA"));

    expect(result).toEqual({ ok: true, imageDataUrl: "data:image/jpeg;base64,AAAA", country: "SA" });
  });

  it("rejects formats Muse can't take, like iPhone HEIC", async () => {
    const result = await parseAnalyzeRequest(form(photo("image/heic"), "SA"));

    expect(result).toEqual({ ok: false, error: "Please upload a JPEG, PNG or WebP photo" });
  });

  it("rejects photos over 5 MB", async () => {
    const result = await parseAnalyzeRequest(form(photo("image/jpeg", 6 * MB), "SA"));

    expect(result).toEqual({ ok: false, error: "Photo is too large (max 5 MB)" });
  });

  it("asks for a photo when none is attached", async () => {
    const result = await parseAnalyzeRequest(form(null, "SA"));

    expect(result).toEqual({ ok: false, error: "Please add a photo" });
  });

  it("asks for a supported country", async () => {
    const result = await parseAnalyzeRequest(form(photo("image/png"), "US"));

    expect(result).toEqual({ ok: false, error: "Please choose a country" });
  });
});
