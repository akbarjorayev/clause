import type { CountryCode } from "@/lib/types";

export interface CountryOption {
  code: CountryCode;
  name: string;
  // Image, not emoji: Windows has no flag emoji.
  flagSrc: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "SA", name: "Saudi Arabia", flagSrc: "/flags/sa.png" },
  { code: "AE", name: "United Arab Emirates", flagSrc: "/flags/ae.png" },
  { code: "RU", name: "Russia", flagSrc: "/flags/ru.png" },
  { code: "MY", name: "Malaysia", flagSrc: "/flags/my.png" },
];

export function countryByCode(code: CountryCode): CountryOption {
  return COUNTRIES.find((c) => c.code === code)!;
}
