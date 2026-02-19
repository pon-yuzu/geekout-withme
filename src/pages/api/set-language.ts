import type { APIRoute } from 'astro';
import type { Lang } from '../../i18n/index';

export const POST: APIRoute = async ({ request, locals }) => {
  const { lang } = (await request.json()) as { lang: string };

  if (lang !== 'en' && lang !== 'ja') {
    return new Response(JSON.stringify({ error: 'Invalid language' }), { status: 400 });
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Set-Cookie': `lang=${lang};Path=/;Max-Age=${60 * 60 * 24 * 365};SameSite=Lax`,
  });

  // Persist to user_metadata if logged in
  if (locals.user && locals.supabase) {
    await locals.supabase.auth.updateUser({
      data: { language_preference: lang as Lang },
    });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
