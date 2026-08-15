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
  const other: Locale = locale === "fr" ? "en" : "fr";

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <a
          href={locale === "en" ? "/en" : "/"}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.2 2.4 6 13.1h5.1l-1.4 8.5 8.4-12.2h-5.2z"
              />
            </svg>
          </span>
          <span className="font-semibold tracking-tight text-ink">{t.title}</span>
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium text-muted hover:bg-card hover:text-ink"
            onClick={() => onLocale(other)}
          >
            {other.toUpperCase()}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-full p-2 text-muted hover:bg-card hover:text-ink"
            onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Light" : "Dark"}
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
