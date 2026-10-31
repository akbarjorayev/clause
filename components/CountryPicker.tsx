import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ViewTransition, type CSSProperties } from "react";
import { COUNTRIES } from "@/lib/client/countries";

export function CountryPicker() {
  return (
    <section aria-labelledby="pick-heading" className="lg:mx-auto lg:max-w-3xl">
      <h1 id="pick-heading" className="text-[2rem] font-bold leading-tight lg:text-center lg:text-5xl">
        Where do you work?
      </h1>
      <ul className="stagger mt-8 grid gap-3 lg:mt-10 lg:grid-cols-2 lg:gap-4">
        {COUNTRIES.map((country, index) => (
          <li key={country.code} style={{ "--i": index } as CSSProperties}>
            {/* Card, flag and name share names with CountryChip: on navigation the card shrinks
                into the chip while the flag and name glide on top of it. */}
            <ViewTransition name={`country-card-${country.code}`} share="morph" default="none">
              <Link
                href={`/${country.code.toLowerCase()}`}
                className="pressable group flex min-h-18 w-full items-center gap-4 rounded-3xl bg-paper px-5 text-xl font-bold shadow-sm ring-1 ring-ink/10"
              >
                <ViewTransition name={`country-flag-${country.code}`} share="morph" default="none">
                  <Image
                    src={country.flagSrc}
                    alt=""
                    width={44}
                    height={44}
                    className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                  />
                </ViewTransition>
                <span className="flex-1">
                  <ViewTransition name={`country-name-${country.code}`} share="morph" default="none">
                    <span className="inline-block">{country.name}</span>
                  </ViewTransition>
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-6 text-ink-soft transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </ViewTransition>
          </li>
        ))}
      </ul>
    </section>
  );
}
