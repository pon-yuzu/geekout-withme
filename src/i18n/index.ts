import { useMemo } from 'react';
import en from './translations/en.json';
import ja from './translations/ja.json';

export type Lang = 'en' | 'ja';

const dictionaries: Record<Lang, Record<string, string>> = { en, ja };

// Server-side lang set by middleware (used during SSR of React components)
let serverLang: Lang = 'en';
export function setServerLang(lang: Lang) { serverLang = lang; }

/** Astro pages: t(lang, 'nav.levelCheck') or t(lang, 'key', { name: 'val' }) */
export function t(lang: Lang, key: string, params?: Record<string, string>): string {
  let str = dictionaries[lang][key] ?? dictionaries['en'][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    }
  }
  return str;
}

/** Read current lang — cookie on client, middleware-set value on server */
export function getLangFromCookie(): Lang {
  if (typeof document === 'undefined') return serverLang;
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|ja)/);
  return (match?.[1] as Lang) ?? 'en';
}

/** Set lang cookie + persist to backend + reload (browser-only) */
export function setLangCookie(lang: Lang): void {
  document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  // Fire-and-forget: persist to user_metadata for logged-in users
  fetch('/api/set-language', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lang }),
  }).finally(() => {
    window.location.reload();
  });
}

/** React hook: const { t, lang } = useTranslation() */
export function useTranslation() {
  const lang = getLangFromCookie();
  const translate = useMemo(() => (key: string, params?: Record<string, string>) => t(lang, key, params), [lang]);
  return { lang, t: translate };
}
