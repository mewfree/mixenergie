import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import type { Theme } from "../lib/theme.ts";

const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
];

type Props = {
  locale: Locale;
  theme: Theme;
  onTheme: (theme: Theme) => void;
  onLocale: (locale: Locale) => void;
};

export function Header({ locale, theme, onTheme, onLocale }: Props) {
  const t = dict[locale];

  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href={locale === "en" ? "/en" : "/"}
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper dark:bg-card dark:text-ink dark:border dark:border-line">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="currentColor"
                d="M13.2 2.4 6 13.1h5.1l-1.4 8.5 8.4-12.2h-5.2z"
              />
            </svg>
          </span>
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold tracking-tight text-ink sm:text-lg">{t.title}</span>
            <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t.live}
            </span>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {/* Segmented language toggle */}
          <div className="inline-flex rounded-lg border border-line bg-card p-0.5 text-xs font-medium">
            {LOCALES.map(({ code, label, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => onLocale(code)}
                className={`cursor-pointer rounded-md px-2.5 py-1 transition-colors ${
                  locale === code
                    ? "bg-ink text-paper font-semibold dark:bg-line dark:text-ink"
                    : "text-muted hover:text-ink"
                }`}
                aria-label={name}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Theme switcher */}
          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:text-ink"
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
