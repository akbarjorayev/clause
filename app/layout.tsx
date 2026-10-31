import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { COUNTRIES } from "@/lib/client/countries";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Designed for legibility; suits small screens in bright light and readers with little schooling.
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const DEFAULT_TITLE = `${SITE_NAME}: ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: "legal",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

// Tells search engines and AI assistants what this is, who it is for and which countries it covers.
const webApplication = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "LegalService",
  operatingSystem: "Any (web browser)",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  audience: { "@type": "Audience", audienceType: "Migrant workers" },
  areaServed: COUNTRIES.map((country) => ({ "@type": "Country", name: country.name })),
  keywords: SITE_KEYWORDS.join(", "),
  featureList: [
    "Photo of a contract or payslip in any language",
    "Plain-English explanation of clauses that break local labour law",
    "Law quoted for every problem found",
    "Hotlines for help",
    "Photo is never stored",
  ],
};

export const viewport: Viewport = {
  themeColor: "#ed5901",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <JsonLd data={webApplication} />
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur [view-transition-name:site-header]">
          <div className="mx-auto flex h-14 w-full max-w-[30rem] items-center px-4 lg:max-w-5xl lg:px-8">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <Image src="/logo.webp" alt="" width={32} height={32} priority className="size-8 rounded-full" />
              Clause
            </Link>
          </div>
        </header>
        {/* One spacing rhythm: 1.5rem on phones, 2.5rem on big screens, at the top, bottom and before the footer. */}
        <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col px-4 py-6 lg:max-w-5xl lg:px-8 lg:py-10">
          <main className="flex-1">{children}</main>
          <footer className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-ink-soft lg:mt-10 [view-transition-name:site-footer]">
            <ShieldCheck aria-hidden className="size-4 shrink-0" />
            <p>Not legal advice. Your photo is never stored.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
