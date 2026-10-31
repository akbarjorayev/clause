"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CountryOption } from "@/lib/client/countries";
import { CheckedPhoto } from "./CheckedPhoto";
import { DotField } from "./DotField";

// A real Muse read takes ~10-15 s, then the check starts.
const READING_SECONDS = 12;

interface Props {
  country: CountryOption;
  photoUrl: string | null;
}

// The worker's photo with drifting dots over it while Muse reads and checks it. The photo itself
// is the shared element that moves in from the photo step; the dimming is a separate layer on top.
export function LoadingView({ country, photoUrl }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const stage =
    seconds < READING_SECONDS ? (
      "Reading your document…"
    ) : (
      <>
        Checking against{" "}
        <span className="whitespace-nowrap">
          <Image src={country.flagSrc} alt="" width={28} height={28} className="mr-1.5 inline-block size-7 align-[-0.2em]" />
          {country.name}
        </span>{" "}
        law…
      </>
    );

  return (
    <section aria-live="polite" className="mx-auto flex max-w-xl flex-col items-center text-center">
      {/* Sized to the photo itself, so no background shows around it. */}
      <div className="relative mx-auto w-fit max-w-full overflow-hidden">
        {photoUrl ? (
          <CheckedPhoto src={photoUrl} alt="" className="block max-h-[60svh] w-auto max-w-full" />
        ) : (
          <div className="aspect-[3/4] w-[min(100vw-2rem,24rem)] bg-ink" />
        )}
        {/* Dimming and dots appear only after the photo has finished moving in. */}
        <div aria-hidden className="after-move absolute inset-0 bg-ink/30" />
        <div aria-hidden className="after-move absolute inset-0">
          <DotField />
        </div>
      </div>
      <h1 className="mt-6 text-2xl font-bold leading-tight">{stage}</h1>
    </section>
  );
}
