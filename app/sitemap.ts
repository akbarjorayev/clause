import type { MetadataRoute } from "next";
import { COUNTRIES } from "@/lib/client/countries";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    ...COUNTRIES.map((country) => ({
      url: `${SITE_URL}/${country.code.toLowerCase()}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
