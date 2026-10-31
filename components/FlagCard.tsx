"use client";

import { useId, useState } from "react";
import { ChevronDown, CircleAlert, Lightbulb, Scale, TriangleAlert } from "lucide-react";
import type { Flag } from "@/lib/types";
import { ReadAloudButton } from "./ReadAloudButton";

// One problem, built to read in a few seconds: a small severity label, a dark title,
// the explanation, "what to do" in its own box, and the law on request.
export function FlagCard({ flag }: { flag: Flag }) {
  const [lawOpen, setLawOpen] = useState(false);
  const lawPanelId = useId();
  const serious = flag.severity === "high";
  const SeverityIcon = serious ? TriangleAlert : CircleAlert;
  const spoken = `${flag.title}. ${flag.explanation} What to do: ${flag.action}`;

  return (
    <article className={`rounded-r-2xl border-l-4 bg-desk/50 p-4 sm:p-5 ${serious ? "border-stamp" : "border-amber-500"}`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold ${
            serious ? "bg-stamp text-paper" : "bg-marker text-amber-950"
          }`}
        >
          <SeverityIcon aria-hidden className="size-4" />
          {serious ? "Serious" : "Check this"}
        </span>
        <ReadAloudButton text={spoken} />
      </div>

      <h3 className="mt-2 text-lg font-bold leading-snug text-ink sm:text-xl">{flag.title}</h3>
      <p className="mt-1.5 text-base leading-relaxed text-ink/85">{flag.explanation}</p>

      <div className="mt-4 rounded-xl bg-paper p-3 sm:p-4">
        <p className="flex items-center gap-1.5 text-sm font-bold text-ink-soft">
          <Lightbulb aria-hidden className="size-4" />
          What to do
        </p>
        <p className="mt-1 text-base leading-relaxed text-ink">{flag.action}</p>
      </div>

      {flag.law_text ? (
        <>
          <button
            type="button"
            onClick={() => setLawOpen((open) => !open)}
            aria-expanded={lawOpen}
            aria-controls={lawPanelId}
            className="pressable mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-ink-soft hover:text-ink"
          >
            <Scale aria-hidden className="size-4 shrink-0" />
            {flag.source}
            <ChevronDown aria-hidden className={`size-4 shrink-0 transition-transform duration-300 ${lawOpen ? "rotate-180" : ""}`} />
          </button>
          {/* Grid rows 0fr → 1fr animates the panel's height smoothly, whatever the text length. */}
          <div
            id={lawPanelId}
            className={`expand grid ${lawOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            inert={!lawOpen}
          >
            <div className="overflow-hidden">
              <blockquote className="mt-1 border-l-2 border-ink/20 pl-3 text-sm leading-relaxed text-ink-soft">
                {flag.law_text}
              </blockquote>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 px-2 text-sm text-ink-soft">
          <Scale aria-label="Law" className="size-4 shrink-0" />
          {flag.source}
        </p>
      )}
    </article>
  );
}
