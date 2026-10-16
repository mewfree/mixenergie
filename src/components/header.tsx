import { PROVINCE_IDS } from "../../shared/types.ts";
import type { Locale, Route } from "../i18n.ts";
import { getDict, pathForRoute } from "../i18n.ts";
import type { Theme } from "../lib/theme.ts";

const LOCALES: { code: Locale; label: string; name: string }[] = [
  { code: "fr", label: "FR", name: "Français" },
  { code: "en", label: "EN", name: "English" },
];

type Props = {
  route: Route;
  theme: Theme;
  onTheme: (theme: Theme) => void;
  onRoute: (route: Route) => void;
};

const TAB = "cursor-pointer border-b-2 pb-0.5 transition-colors";
const TAB_ON = "border-ink text-ink";
const TAB_OFF = "border-transparent text-muted hover:text-ink";

export function Header({ route, theme, onTheme, onRoute }: Props) {
  const { province, locale } = route;
  const t = getDict(province, locale);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <a href={pathForRoute(route)} className="flex items-baseline">
          <span className="text-lg font-semibold tracking-tight text-ink">
            {t.title}
          </span>
        </a>

        <div className="flex items-center gap-5">
          <nav
            className="flex items-center gap-3 text-xs font-semibold tracking-wide"
            aria-label={t.provinceLabel}
          >
            {PROVINCE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onRoute({ province: id, locale })}
                aria-label={t.province[id]}
                aria-pressed={province === id}
                className={`${TAB} ${province === id ? TAB_ON : TAB_OFF}`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
            {LOCALES.map(({ code, label, name }) => (
              <button
                key={code}
                type="button"
                onClick={() => onRoute({ province, locale: code })}
                aria-label={name}
                aria-pressed={locale === code}
                className={`${TAB} ${locale === code ? TAB_ON : TAB_OFF}`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex h-8 w-8 cursor-pointer items-center justify-center text-muted transition-colors hover:text-ink"
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
