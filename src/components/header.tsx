import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import type { Theme } from "../lib/theme.ts";

type Props = {
  locale: Locale;
  theme: Theme;
  onTheme: (theme: Theme) => void;
  onLocale: (locale: Locale) => void;
};

export function Header({ locale, theme, onTheme, onLocale }: Props) {
  const t = dict[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href={locale === "en" ? "/en" : "/"}
          className="group flex items-center gap-2.5 transition-transform active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-on-accent shadow-sm shadow-accent/30 transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.2 2.4 6 13.1h5.1l-1.4 8.5 8.4-12.2h-5.2z"
              />
            </svg>
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-extrabold tracking-tight text-ink">{t.title}</span>
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.live}
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {/* Segmented language toggle */}
          <div className="inline-flex rounded-full border border-line bg-card/60 p-0.5 text-xs sm:text-sm font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => onLocale("fr")}
              className={`cursor-pointer rounded-full px-3 py-1 transition-all ${
                locale === "fr"
                  ? "bg-accent text-on-accent shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              aria-label="Français"
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => onLocale("en")}
              className={`cursor-pointer rounded-full px-3 py-1 transition-all ${
                locale === "en"
                  ? "bg-accent text-on-accent shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              aria-label="English"
            >
              EN
            </button>
          </div>

          {/* Theme switcher */}
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-card/60 text-muted shadow-xs transition-colors hover:border-line hover:bg-card hover:text-ink"
            onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-16a1 1 0 0 1 1 1v1.2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 16.8a1 1 0 0 1 1 1V21a1 1 0 1 1-2 0v-1.2a1 1 0 0 1 1-1Zm10-6.8a1 1 0 0 1-1 1h-1.2a1 1 0 1 1 0-2H21a1 1 0 0 1 1 1ZM5.2 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h1.2a1 1 0 0 1 1 1Zm12.9-6.4a1 1 0 0 1 0 1.4l-.85.85a1 1 0 1 1-1.4-1.4l.84-.85a1 1 0 0 1 1.41 0ZM7.15 16.15a1 1 0 0 1 0 1.4l-.85.85a1 1 0 0 1-1.4-1.4l.84-.85a1 1 0 0 1 1.41 0Zm11.1 1.4a1 1 0 0 1-1.4 0l-.85-.85a1 1 0 1 1 1.4-1.4l.85.84a1 1 0 0 1 0 1.41ZM8 7.15a1 1 0 0 1-1.4 0l-.85-.85A1 1 0 0 1 7.15 4.9l.85.84A1 1 0 0 1 8 7.15Z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.6 14.8A7.2 7.2 0 0 1 9.1 4.7a.7.7 0 0 0-.9-.9 8.6 8.6 0 1 0 11.9 11.9.7.7 0 0 0-.9-.9 7.1 7.1 0 0 1-2.6 0Z"
      />
    </svg>
  );
}
