import type { APIRoute } from 'astro';
import { DAILY_LIMITS } from '../../lib/quota';

export const GET: APIRoute = async ({ locals }) => {
  const supabase = locals.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Not configured' }), { status: 500 });
  }

  try {
    const { data, error } = await supabase.rpc('get_daily_usage');

    if (error) {
      console.error('get_daily_usage error:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch usage' }), { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    const usage = {
      level_check: {
        used: row?.level_check ?? 0,
        limit: DAILY_LIMITS.level_check,
      },
      workbook: {
        used: row?.workbook ?? 0,
        limit: DAILY_LIMITS.workbook,
      },
      translation: {
        used: row?.translation ?? 0,
        limit: DAILY_LIMITS.translation,
      },
    };

    return new Response(JSON.stringify(usage), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (err) {
    console.error('Usage API error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
};
