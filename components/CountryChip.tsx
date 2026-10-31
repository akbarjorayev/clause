import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ViewTransition } from "react";
import type { CountryOption } from "@/lib/client/countries";

// Shows the chosen country and takes the worker back to change it.
export function CountryChip({ country }: { country: CountryOption }) {
  return (
    // Names match the card in CountryPicker, so the card morphs into this chip.
    <ViewTransition name={`country-card-${country.code}`} share="morph" default="none">
      <Link
        href="/"
        aria-label={`Change country (${country.name})`}
        className="pressable group inline-flex min-h-11 items-center gap-2 rounded-full bg-paper py-1 pl-3 pr-4 text-base font-bold shadow-sm ring-1 ring-ink/10"
      >
        <ArrowLeft aria-hidden className="size-5 transition-transform duration-200 group-hover:-translate-x-1" />
        <ViewTransition name={`country-flag-${country.code}`} share="morph" default="none">
          <Image src={country.flagSrc} alt="" width={24} height={24} />
        </ViewTransition>
        <ViewTransition name={`country-name-${country.code}`} share="morph" default="none">
          <span className="inline-block">{country.name}</span>
        </ViewTransition>
      </Link>
    </ViewTransition>
  );
}
