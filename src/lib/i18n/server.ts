import { cookies, headers } from "next/headers";
import { dictionaries, defaultLocale, locales, type Locale } from "./dictionaries";

const COOKIE_NAME = "moniny_locale";

function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return defaultLocale;
  const langs = header.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const lang of langs) {
    if (lang.startsWith("es")) return "es";
    if (lang.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE_NAME)?.value;
  if (fromCookie && locales.includes(fromCookie as Locale)) {
    return fromCookie as Locale;
  }
  const headerStore = await headers();
  return parseAcceptLanguage(headerStore.get("accept-language"));
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}

export { COOKIE_NAME };
