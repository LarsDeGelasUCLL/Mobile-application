// Dates in the app language's locale (`useI18n().locale`).

/** Short date, e.g. 26/11/2026. */
export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(
    new Date(iso),
  );
}

/** Short date and time, e.g. 26/11/2026, 11:00. */
export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
