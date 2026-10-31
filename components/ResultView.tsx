"use client";

import { CircleCheck, Quote, RotateCcw } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { groupFlagsByClause } from "@/lib/client/groupFlagsByClause";
import type { Flag, Hotline } from "@/lib/types";
import { Celebration } from "./Celebration";
import { CheckedPhoto } from "./CheckedPhoto";
import { FlagCard } from "./FlagCard";
import { HotlineList } from "./HotlineList";

interface Props {
  flags: Flag[];
  hotlines: Hotline[];
  // The photo that was checked.
  photoUrl: string | null;
  onRestart: () => void;
}

// Matches the photo move in globals.css (::view-transition-group(.photo-move)).
const PHOTO_MOVE_MS = 850;

function verdict(flags: Flag[]): string {
  if (flags.length === 0) return "Looks good";
  return flags.length === 1 ? "1 problem found" : `${flags.length} problems found`;
}

export function ResultView({ flags, hotlines, photoUrl, onRestart }: Props) {
  // With a photo, the verdict badge (and confetti) only appear once the photo has finished moving
  // into place; until then they are not rendered at all.
  const [settled, setSettled] = useState(!photoUrl);
  useEffect(() => {
    if (!photoUrl) return;
    const timer = setTimeout(() => setSettled(true), PHOTO_MOVE_MS);
    return () => clearTimeout(timer);
  }, [photoUrl]);

  const groups = groupFlagsByClause(flags);
  const clean = flags.length === 0;

  // On a photo, everything is sized in em from a font size tied to the photo's width (cqw), so the
  // stamp always fits inside it, even mid-animation (it starts at 1.4x), on narrow or tiny photos.
  const stampSize = photoUrl
    ? "text-[length:min(6.5cqw,1.75rem)] gap-[0.3em] rounded-[0.6em] border-[0.15em] px-[0.6em] py-[0.3em]"
    : "text-2xl gap-2 rounded-2xl border-4 px-4 py-2 sm:text-[1.75rem]";
  const stamp = (
    <h1
      id="verdict"
      className={`stamp inline-flex items-center whitespace-nowrap bg-paper/90 font-bold leading-tight backdrop-blur-sm ${stampSize} ${
        clean ? "border-safe text-safe" : "border-stamp text-stamp"
      }`}
    >
      {clean && <CircleCheck aria-hidden className="size-[1.1em] shrink-0" />}
      {verdict(flags)}
    </h1>
  );

  // Phones: one column (verdict, cards, help). Big screens: a left panel that fills the screen and
  // stays put, verdict at its top and help pinned to the bottom-left, with cards scrolling on the right.
  // The panel uses `contents` on phones so its children slot into the column order around the cards.
  // A clean result has no cards, so it stays one centred column everywhere.
  return (
    <section
      aria-labelledby="verdict"
      className={
        clean
          ? "mx-auto flex max-w-xl flex-col gap-8"
          : "flex flex-col gap-8 lg:grid lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-x-10"
      }
    >
      <aside
        className={
          clean
            ? "contents"
            : "contents lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100dvh-8.5rem)] lg:flex-col lg:justify-between lg:gap-8"
        }
      >
        <div className="order-1">
          {clean && settled && <Celebration />}
          {photoUrl ? (
            // The checked photo with the verdict stamped on top of it.
            <div className="relative mx-auto w-fit max-w-full overflow-hidden">
              <CheckedPhoto src={photoUrl} alt="Your document" className="block max-h-[50svh] w-auto max-w-full lg:max-h-[min(40dvh,24rem)]" />
              {/* A size container that takes the photo's width, so the stamp scales with the photo. */}
              <div className="@container absolute inset-0 grid place-items-center">{settled && stamp}</div>
            </div>
          ) : (
            stamp
          )}
        </div>

        <div className="order-3">
          {/* Nothing to get help with when the document looks good. */}
          {!clean && <HotlineList hotlines={hotlines} />}
          <button
            type="button"
            onClick={onRestart}
            className="pressable group mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-paper px-5 text-lg font-bold shadow-sm ring-1 ring-ink/10"
          >
            <RotateCcw aria-hidden className="size-5" />
            Check another document
          </button>
        </div>
      </aside>

      <ol className={`stagger order-2 grid gap-5 lg:col-start-2 lg:row-start-1 ${clean ? "hidden" : ""}`}>
        {groups.map((group, index) => {
          const groupSerious = group.flags.some((f) => f.severity === "high");
          return (
            <li
              key={group.clause}
              style={{ "--i": index + 2 } as CSSProperties}
              className="rounded-3xl bg-paper p-4 shadow-sm ring-1 ring-ink/10 lg:p-5"
            >
              <blockquote className="flex gap-2 px-1 text-base italic leading-relaxed text-ink/85">
                <Quote aria-label="Your document says" className="mt-0.5 size-5 shrink-0 text-ink-soft" />
                <p>
                  <span className={groupSerious ? "mark-high" : "mark-medium"}>{group.clause}</span>
                </p>
              </blockquote>
              <div className="mt-4 grid gap-3">
                {group.flags.map((flag) => (
                  <FlagCard key={`${flag.rule_id}-${flag.title}`} flag={flag} />
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
