// Facts about the site used for SEO (metadata, sitemap, structured data) and for AI search engines.

export const SITE_NAME = "Clause";
export const SITE_TAGLINE = "Check your work contract against local labour law";
export const SITE_DESCRIPTION =
  "Take a photo of your work contract or payslip, in any language, and see in plain English which parts break the labour law of the country you work in. Free. Your photo is never stored.";

// Set NEXT_PUBLIC_SITE_URL to the real domain once deployed. Vercel's production URL is the fallback.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3100")
).replace(/\/$/, "");

export const SITE_KEYWORDS = [
  "work contract checker",
  "migrant worker rights",
  "labour law",
  "employment contract",
  "payslip check",
  "passport confiscation",
  "recruitment fees",
  "unpaid overtime",
  "Saudi Arabia labour law",
  "UAE labour law",
  "Russia labour code",
  "Malaysia Employment Act",
];
