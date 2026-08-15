import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = dict[locale];
  return (
    <footer className="border-t border-line px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-3 text-sm leading-relaxed text-muted">
        <h2 className="font-semibold text-ink">{t.aboutTitle}</h2>
        <p>{t.about}</p>
        <p>{t.delay}</p>
        <p>{t.license}</p>
        <p>
          <a
            className="underline decoration-line underline-offset-4 hover:text-ink"
            href="https://donnees.hydroquebec.com/"
          >
            {t.sourcesLink}
          </a>
        </p>
        <p>{t.notOfficial}</p>
      </div>
    </footer>
  );
}
