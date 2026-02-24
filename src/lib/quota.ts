import { createClient } from '@supabase/supabase-js';

export type QuotaFeature = 'level_check' | 'workbook' | 'translation';

export const DAILY_LIMITS: Record<QuotaFeature, number> = {
  level_check: 5,
  workbook: 1,
  translation: 50,
};

export interface QuotaResult {
  allowed: boolean;
  current: number;
  limit: number;
}

function getServiceClient(locals: any) {
  const runtime = locals.runtime;
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = runtime?.env?.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

export async function tryIncrementUsage(
  locals: any,
  feature: QuotaFeature,
): Promise<QuotaResult> {
  const limit = DAILY_LIMITS[feature];

  try {
    const client = getServiceClient(locals);
    if (!client) {
      // Fail open if no service client
      return { allowed: true, current: 0, limit };
    }

    const { data, error } = await client.rpc('increment_usage', {
      p_feature: feature,
      p_limit: limit,
    });

    if (error) {
      console.error('Quota RPC error:', error);
      return { allowed: true, current: 0, limit }; // fail open
    }

    const result = data as number;
    if (result === -1) {
      return { allowed: false, current: limit, limit };
    }

    return { allowed: true, current: result, limit };
  } catch (err) {
    console.error('Quota check failed:', err);
    return { allowed: true, current: 0, limit }; // fail open
  }
}

export function quotaExceededResponse(feature: QuotaFeature, lang?: string): Response {
  const isJa = lang === 'ja';
  const messages: Record<QuotaFeature, { en: string; ja: string }> = {
    level_check: {
      en: "Today's level check quota has been reached. Please try again tomorrow.",
      ja: '本日のレベルチェック回数の上限に達しました。明日またお試しください。',
    },
    workbook: {
      en: "Today's workbook generation quota has been reached. Please try again tomorrow.",
      ja: '本日のワークブック生成の上限に達しました。明日またお試しください。',
    },
    translation: {
      en: "Today's translation quota has been reached. Please try again tomorrow.",
      ja: '本日の翻訳回数の上限に達しました。明日またお試しください。',
    },
  };

  const msg = isJa ? messages[feature].ja : messages[feature].en;
  return new Response(JSON.stringify({ error: msg, quotaExceeded: true }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}
