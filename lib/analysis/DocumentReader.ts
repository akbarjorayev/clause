import type { MuseClient } from "@/lib/muse/MuseClient";
import type { Reading } from "@/lib/types";

// Validated against Muse in eval/reading-test.mjs; change wording only together with the eval.
const READ_PROMPT = `You are reading a photo of an employment document (contract, offer letter or payslip).
Extract it faithfully. Do not judge or summarise. Write every field in English only,
never in the document's original language (names in Latin letters). Return ONLY JSON:
{
  "doc_type": "contract | offer_letter | payslip | other",
  (offer_letter also covers demand letters, job orders and recruitment terms that state a worker's
  pay, hours or conditions; "other" is only for documents with no employment terms at all)
  "doc_language": "ISO 639-1 code",
  "readable": true/false,
  "parties": { "employer": "", "worker": "" },
  "clauses": [ { "english": "faithful English translation", "topic": "short tag" } ],
  "amounts": [ { "label": "", "value": "", "currency": "ISO 4217 code" } ]
}
Include every clause and every table row. Keep numbers exactly as written.`;

// Step A: turns a photo of a document, in any language, into English clauses.
export class DocumentReader {
  constructor(private readonly muse: MuseClient) {}

  read(imageDataUrl: string): Promise<Reading> {
    return this.muse.completeJson<Reading>([
      { type: "text", text: READ_PROMPT },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ]);
  }
}
