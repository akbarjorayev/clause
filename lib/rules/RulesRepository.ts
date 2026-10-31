import ae from "@/rules/ae.json";
import my from "@/rules/my.json";
import ru from "@/rules/ru.json";
import sa from "@/rules/sa.json";
import universal from "@/rules/universal.json";
import type { CountryCode, CountryRules } from "@/lib/types";

// Static imports so the bundler ships the rules with the API route.
const RULES_BY_COUNTRY: Record<CountryCode, CountryRules> = {
  SA: sa as CountryRules,
  AE: ae as CountryRules,
  RU: ru as CountryRules,
  MY: my as CountryRules,
};

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && Object.hasOwn(RULES_BY_COUNTRY, value);
}

export class RulesRepository {
  forCountry(code: CountryCode): CountryRules {
    return RULES_BY_COUNTRY[code];
  }

  universal(): CountryRules {
    return universal as CountryRules;
  }
}
