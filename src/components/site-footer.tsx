import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = dict[locale];
  return (
    <footer className="mt-16 border-t border-line/60 bg-card/30 px-4 py-12 transition-colors sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Column 1: Methodology */}
          <div className="space-y-2.5 text-sm leading-relaxed text-muted">
            <h2 className="font-bold tracking-tight text-ink">
              {t.aboutTitle}
            </h2>
            <p className="text-xs leading-relaxed sm:text-sm">{t.about}</p>
            <p className="text-xs leading-relaxed text-muted/80">{t.delay}</p>
          </div>

          {/* Column 2: Sources, License, Disclaimer */}
          <div className="space-y-2.5 text-sm leading-relaxed text-muted">
            <h2 className="font-bold tracking-tight text-ink">
              {locale === "fr" ? "Sources & mentions" : "Sources & legal"}
            </h2>
            <p className="text-xs sm:text-sm">
              <a
                className="group inline-flex items-center gap-1 font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                href="https://donnees.hydroquebec.com/"
                target="_blank"
                rel="noreferrer"
              >
                {t.sourcesLink}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted group-hover:text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              {" · "}
              <span className="text-xs text-muted">{t.license}</span>
            </p>
            <div className="rounded-lg border border-line/60 bg-paper/60 p-3 text-xs text-muted">
              <p>{t.notOfficial}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
