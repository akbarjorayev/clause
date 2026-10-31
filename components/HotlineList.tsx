import { Globe, Phone } from "lucide-react";
import type { Hotline } from "@/lib/types";

function isWebsite(contact: string): boolean {
  return contact.startsWith("http");
}

export function HotlineList({ hotlines }: { hotlines: Hotline[] }) {
  if (hotlines.length === 0) return null;

  return (
    <section aria-labelledby="help-heading">
      {/* Hidden visually; screen readers still announce what the list is. */}
      <h2 id="help-heading" className="sr-only">Get help</h2>
      <ul className="grid gap-2">
        {hotlines.map((hotline) => {
          const website = isWebsite(hotline.contact);
          const Icon = website ? Globe : Phone;
          return (
            <li key={hotline.contact}>
              <a
                href={website ? hotline.contact : `tel:${hotline.contact.replace(/\s+/g, "")}`}
                {...(website && { target: "_blank", rel: "noopener noreferrer" })}
                className="pressable group flex min-h-16 items-center gap-4 rounded-3xl bg-paper px-5 py-2 shadow-sm ring-1 ring-ink/10"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-paper transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-lg font-bold text-accent">{hotline.contact.replace(/^https?:\/\//, "")}</span>
                  <span className="text-base text-ink-soft">{hotline.name}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
