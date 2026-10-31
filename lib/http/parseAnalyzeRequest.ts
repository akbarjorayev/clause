import { isCountryCode } from "@/lib/rules/RulesRepository";
import type { CountryCode } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type AnalyzeRequest =
  | { ok: true; imageDataUrl: string; country: CountryCode }
  | { ok: false; error: string };

export async function parseAnalyzeRequest(form: FormData): Promise<AnalyzeRequest> {
  const image = form.get("image");
  const country = form.get("country");

  if (!(image instanceof File) || image.size === 0) return { ok: false, error: "Please add a photo" };
  if (!ACCEPTED_TYPES.includes(image.type)) return { ok: false, error: "Please upload a JPEG, PNG or WebP photo" };
  if (image.size > MAX_BYTES) return { ok: false, error: "Photo is too large (max 5 MB)" };
  if (!isCountryCode(country)) return { ok: false, error: "Please choose a country" };

  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  return { ok: true, imageDataUrl: `data:${image.type};base64,${base64}`, country };
}
