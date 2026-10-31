import { describe, expect, it } from "vitest";
import { ContractAnalyzer } from "@/lib/analysis/ContractAnalyzer";
import { ContractChecker } from "@/lib/analysis/ContractChecker";
import { DocumentReader } from "@/lib/analysis/DocumentReader";
import { RulesRepository } from "@/lib/rules/RulesRepository";
import check from "@/lib/muse/fixtures/sa-check.json";
import reading from "@/lib/muse/fixtures/sa-reading.json";
import { RecordingMuse } from "./support/RecordingMuse";

const IMAGE = "data:image/jpeg;base64,AAAA";
const rules = new RulesRepository();
const SA_HOTLINES = rules.forCountry("SA").hotlines;

function analyzerAnswering(readAnswer: unknown, checkAnswer: unknown) {
  const muse = new RecordingMuse([readAnswer, checkAnswer]);
  const analyzer = new ContractAnalyzer(new DocumentReader(muse), new ContractChecker(muse), rules);
  return { analyzer, muse };
}

describe("ContractAnalyzer", () => {
  it("reads then checks a document and returns flags with the country's hotlines", async () => {
    const { analyzer } = analyzerAnswering(reading, check);

    const result = await analyzer.analyze(IMAGE, "SA");

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.docType).toBe("contract");
    expect(result.flags).toHaveLength(7);
    expect(result.hotlines).toEqual(SA_HOTLINES);
  });

  it("asks for a retake when the photo is unreadable, without checking", async () => {
    const { analyzer, muse } = analyzerAnswering({ ...reading, readable: false, clauses: [] }, check);

    const result = await analyzer.analyze(IMAGE, "SA");

    expect(result).toEqual({ status: "unreadable", hotlines: SA_HOTLINES });
    expect(muse.requests).toHaveLength(1);
  });

  it("says it isn't a work document when the photo shows something else, without checking", async () => {
    const { analyzer, muse } = analyzerAnswering({ ...reading, doc_type: "other" }, check);

    const result = await analyzer.analyze(IMAGE, "SA");

    expect(result).toEqual({ status: "not_work_document", hotlines: SA_HOTLINES });
    expect(muse.requests).toHaveLength(1);
  });

  it("says it isn't a work document when no clauses were found", async () => {
    const { analyzer } = analyzerAnswering({ ...reading, clauses: [] }, check);

    const result = await analyzer.analyze(IMAGE, "SA");

    expect(result.status).toBe("not_work_document");
  });

  it("reports a clean document as ok with no flags", async () => {
    const { analyzer } = analyzerAnswering(reading, { flags: [] });

    const result = await analyzer.analyze(IMAGE, "SA");

    expect(result).toEqual({ status: "ok", docType: "contract", flags: [], hotlines: SA_HOTLINES });
  });
});
