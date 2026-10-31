import type { RulesRepository } from "@/lib/rules/RulesRepository";
import type { AnalysisResult, CountryCode } from "@/lib/types";
import type { ContractChecker } from "./ContractChecker";
import type { DocumentReader } from "./DocumentReader";

// Runs the whole analysis: read the photo, then check it against the country's rules.
export class ContractAnalyzer {
  constructor(
    private readonly reader: DocumentReader,
    private readonly checker: ContractChecker,
    private readonly rules: RulesRepository,
  ) {}

  async analyze(imageDataUrl: string, country: CountryCode): Promise<AnalysisResult> {
    const countryRules = this.rules.forCountry(country);
    const hotlines = countryRules.hotlines ?? [];

    const reading = await this.reader.read(imageDataUrl);
    if (!reading.readable) return { status: "unreadable", hotlines };
    // A receipt or a blank page would otherwise come back as "No problems found".
    if (reading.doc_type === "other" || reading.clauses.length === 0) return { status: "not_work_document", hotlines };

    const flags = await this.checker.check(reading, countryRules, this.rules.universal());
    return { status: "ok", docType: reading.doc_type, flags, hotlines };
  }
}
