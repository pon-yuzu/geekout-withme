import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase';
import { setServerLang, type Lang } from './i18n/index';

export const onRequest = defineMiddleware(async ({ request, locals, redirect }, next) => {
  // Redirect old domain to new domain
  const url = new URL(request.url);
  if (url.hostname === 'geekout-withme.pages.dev') {
    return Response.redirect(`https://uchiwai.app${url.pathname}${url.search}`, 301);
  }

  const isWebSocket = request.headers.get('Upgrade') === 'websocket';

  // ── Language detection ──
  const cookies = request.headers.get('cookie') ?? '';
  const langMatch = cookies.match(/(?:^|;\s*)lang=(en|ja)/);
  let lang: Lang = (langMatch?.[1] as Lang) ?? 'en';

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth when Supabase is not configured — free features still work
  if (!supabaseUrl || !supabaseAnonKey) {
    locals.user = null;
    locals.supabase = null;
    locals.lang = lang;
    setServerLang(lang);
    return next();
  }

  const responseHeaders = new Headers();
  const supabase = createSupabaseServerClient(request, responseHeaders);

  // Use getSession() for fast JWT-based validation (no DB round-trip).
  // getSession() decodes the JWT locally and auto-refreshes expired tokens,
  // which is essential for keeping users logged in. API endpoints that
  // mutate data go through Supabase RLS which re-validates server-side.
  // Note: getUser() was tried but breaks on CF Workers (no token refresh,
  // network latency causes timeouts, users appear logged-out).
  const { data: { session } } = await supabase.auth.getSession();

  locals.user = session?.user ?? null;
  locals.supabase = supabase;

  // If logged-in user has no lang cookie, restore from user_metadata
  if (!isWebSocket && locals.user && !langMatch) {
    const pref = locals.user.user_metadata?.language_preference as Lang | undefined;
    if (pref && (pref === 'en' || pref === 'ja')) {
      lang = pref;
    }
  }

  locals.lang = lang;
  if (!isWebSocket) setServerLang(lang);

  const response = await next();

  // Copy supabase auth cookies to response
  // WebSocket 101 responses may have immutable headers — skip safely
  if (response.status !== 101) {
    responseHeaders.forEach((value, key) => {
      response.headers.append(key, value);
    });
  }

  return response;
});
