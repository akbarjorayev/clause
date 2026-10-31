import { MuseResponseError } from "./MuseResponseError";

// Muse sometimes wraps its JSON in code fences or a sentence, so parse the outermost object.
export function extractJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new MuseResponseError("Muse answer contains no JSON object");
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    throw new MuseResponseError("Muse answer is not valid JSON");
  }
}
