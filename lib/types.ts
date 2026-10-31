export type CountryCode = "SA" | "AE" | "RU" | "MY";

export type Severity = "high" | "medium";

export interface Rule {
  id: string;
  topic: string;
  severity: Severity;
  match_hint: string;
  why: string;
  source: string;
  // Quoted text of the law, shown to the worker on request; never sent to Muse.
  law_text: string;
  action: string;
}

export interface Hotline {
  name: string;
  contact: string;
}

export interface CountryRules {
  country: string;
  name: string;
  sources: string[];
  rules: Rule[];
  hotlines?: Hotline[];
  note?: string;
}

export interface Clause {
  english: string;
  topic: string;
}

export interface Reading {
  doc_type: string;
  doc_language: string;
  readable: boolean;
  parties: { employer: string; worker: string };
  clauses: Clause[];
  amounts: { label: string; value: string; currency: string }[];
}

export interface Flag {
  rule_id: string;
  severity: Severity;
  clause: string;
  title: string;
  explanation: string;
  source: string;
  // Filled from our rules file after Muse answers.
  law_text?: string;
  action: string;
}

export type AnalysisResult =
  | { status: "ok"; docType: string; flags: Flag[]; hotlines: Hotline[] }
  | { status: "unreadable"; hotlines: Hotline[] }
  | { status: "not_work_document"; hotlines: Hotline[] };
