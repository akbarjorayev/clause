import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckFlow } from "@/components/CheckFlow";
import { JsonLd } from "@/components/JsonLd";
import { COUNTRIES, countryByCode } from "@/lib/client/countries";
import { isCountryCode } from "@/lib/rules/RulesRepository";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import type { CountryCode } from "@/lib/types";

// A page that sets its own openGraph replaces the layout's, so the sharing image is repeated here.
const SHARE_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: `${SITE_NAME}: ${SITE_TAGLINE}` };

// One short, shareable page per country: /sa, /ae, /ru, /my.
export function generateStaticParams() {
  return COUNTRIES.map((c) => ({ country: c.code.toLowerCase() }));
}

function toCountryCode(segment: string): CountryCode {
  const code = segment.toUpperCase();
  if (!isCountryCode(code)) notFound();
  return code;
}

function descriptionFor(countryName: string): string {
  return `Take a photo of your work contract or payslip and see which clauses break ${countryName} labour law, in plain English, with the law quoted and hotlines for help. Free. Your photo is never stored.`;
}

export async function generateMetadata({ params }: PageProps<"/[country]">): Promise<Metadata> {
  const { country } = await params;
  const name = countryByCode(toCountryCode(country)).name;
  const path = `/${country.toLowerCase()}`;
  const title = `Check your work contract in ${name}`;
  const description = descriptionFor(name);
  return {
    title,
    description,
    keywords: [`${name} labour law`, `${name} work contract`, `${name} migrant worker rights`],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      locale: "en",
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: ["/twitter-image.png"] },
  };
}

async function CountryCheck({ params }: { params: PageProps<"/[country]">["params"] }) {
  const { country } = await params;
  const code = toCountryCode(country);
  if (country !== country.toLowerCase()) redirect(`/${country.toLowerCase()}`);
  const name = countryByCode(code).name;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
            { "@type": "ListItem", position: 2, name, item: `${SITE_URL}/${country}` },
          ],
        }}
      />
      <CheckFlow country={code} />
    </>
  );
}

// The URL segment is read inside Suspense so the shared app shell can be prefetched for every country link.
export default function CountryPage({ params }: PageProps<"/[country]">) {
  return (
    <Suspense>
      <CountryCheck params={params} />
    </Suspense>
  );
}
