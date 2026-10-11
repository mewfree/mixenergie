import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = dict[locale];
  return (
    <footer className="mt-20 border-t border-ink pb-12 pt-8">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 sm:grid-cols-2 sm:px-6">
        <div className="space-y-3">
          <h2 className="kicker text-ink">{t.aboutTitle}</h2>
          <p className="text-sm leading-relaxed text-muted">{t.about}</p>
          <p className="text-xs leading-relaxed text-muted">{t.delay}</p>
        </div>

        <div className="space-y-3">
          <h2 className="kicker text-ink">{t.legalTitle}</h2>
          <p className="text-sm text-muted">
            <a
              className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              href="https://donnees.hydroquebec.com/"
              target="_blank"
              rel="noreferrer"
            >
              {t.sourcesLink}
            </a>
            {" · "}
            {t.license}
          </p>
          <p className="text-xs leading-relaxed text-muted">{t.notOfficial}</p>
        </div>
      </div>
    </footer>
  );
}
