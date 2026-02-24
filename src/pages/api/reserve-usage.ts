import type { APIRoute } from 'astro';
import { tryIncrementUsage, quotaExceededResponse, DAILY_LIMITS } from '../../lib/quota';
import type { QuotaFeature } from '../../lib/quota';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const { feature, uiLang } = body;
  if (!feature || !['level_check', 'workbook'].includes(feature)) {
    return new Response(JSON.stringify({ error: 'Invalid feature' }), { status: 400 });
  }

  const quotaResult = await tryIncrementUsage(locals, feature as QuotaFeature);
  if (!quotaResult.allowed) {
    return quotaExceededResponse(feature as QuotaFeature, uiLang);
  }

  const limit = DAILY_LIMITS[feature as QuotaFeature];
  return new Response(JSON.stringify({
    allowed: true,
    remaining: limit - quotaResult.current,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
